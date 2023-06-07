import { AppDataSource } from ".."
import { Contact, LinkPrecedenceEnum } from "../entities/Contact"

type IdentifyContactServiceType = {
    email?: string
    phoneNumber?: number
}

const createNewContact = async ({ email, phoneNumber }: IdentifyContactServiceType) => {
    const contactRepo = AppDataSource.getRepository(Contact)
    const newContact = contactRepo.create({
        email,
        phoneNumber: phoneNumber?.toString(),
        linkPrecedence: LinkPrecedenceEnum.PRIMARY,
        linkedContact: null
    })

    await newContact.save();

    return {
        primaryContactId: newContact.id,
        emails: [newContact.email],
        phoneNumbers: [newContact.phoneNumber],
        secondaryContactIds: [],
    }
}

const fetchLinkedContacts = async (primaryContact: Contact) => {
    const contactRepo = AppDataSource.getRepository(Contact)
    const secondaryContacts = await contactRepo.find({
        where: {
            linkedContact: {
                id: primaryContact.id
            },
            linkPrecedence: LinkPrecedenceEnum.SECONDARY
        }
    })

    let phoneNumbers = secondaryContacts.filter(item => item.phoneNumber != primaryContact.phoneNumber).map(item => (item.phoneNumber));
    phoneNumbers = [primaryContact.phoneNumber, ...new Set(phoneNumbers)];

    let emails = secondaryContacts.filter(item => item.email != primaryContact.email).map(item => (item.email));
    emails = [primaryContact.email, ...new Set(emails)];

    const secondaryContactIds = secondaryContacts.map(item => (item.id));

    return {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds
    }
}

export const identifyContactService = async (data: IdentifyContactServiceType) => {
    try {
        const { email, phoneNumber } = data
        const contactRepo = AppDataSource.getRepository(Contact)

        // first finding if there already exists any contacts with similar info
        let existingContacts: Contact[] | null
        if (phoneNumber && !email) {
            existingContacts = await contactRepo.find({
                where: { phoneNumber: phoneNumber.toString() },
                relations: ["linkedContact"]
            })
        } else if (email && !phoneNumber) {
            existingContacts = await contactRepo.find({
                where: { email },
                relations: ["linkedContact"]
            })
        }
        // if there isn't any similar contact created prior to this one then create a new one
        if (existingContacts && existingContacts.length == 0) {
            return createNewContact({ email, phoneNumber })
        }
        else if (existingContacts && existingContacts.length > 0) {
            return fetchLinkedContacts(existingContacts[0].linkedContact ?? existingContacts[0])
        }

        if (email && phoneNumber) {
            const existingContactsWithEmail = await contactRepo.find({
                where: { email },
                relations: ["linkedContact"]
            })
            const existingContactsWithPhone = await contactRepo.find({
                where: { phoneNumber: phoneNumber.toString() },
                relations: ["linkedContact"]
            })

            if (existingContactsWithEmail.length === 0 && existingContactsWithPhone.length === 0) {
                return await createNewContact({ email, phoneNumber })
            } else if ((existingContactsWithEmail.length === 0 && existingContactsWithPhone.length > 0) || (existingContactsWithEmail.length > 0 && existingContactsWithPhone.length === 0)) {

                const newSecondaryContact = contactRepo.create({
                    email: email,
                    phoneNumber: phoneNumber.toString(),
                    linkPrecedence: LinkPrecedenceEnum.SECONDARY,
                    linkedContact: (existingContactsWithEmail && existingContactsWithEmail[0]) ?? (existingContactsWithPhone && existingContactsWithPhone[0])
                })

                await newSecondaryContact.save()
                return fetchLinkedContacts(newSecondaryContact.linkedContact)
            } else if (existingContactsWithEmail.length > 0 && existingContactsWithPhone.length > 0) {
                const primaryContactForEmail = existingContactsWithEmail[0].linkedContact == null ? existingContactsWithEmail[0] : existingContactsWithEmail[0].linkedContact
                const primaryContactForPhone = existingContactsWithPhone[0].linkedContact == null ? existingContactsWithPhone[0] : existingContactsWithPhone[0].linkedContact

                if (primaryContactForEmail && primaryContactForPhone && primaryContactForEmail.id === primaryContactForPhone.id) {
                    return fetchLinkedContacts(primaryContactForEmail)
                } else {
                    const olderPrimaryContact = primaryContactForEmail.createdAt > primaryContactForPhone.createdAt ? primaryContactForPhone : primaryContactForEmail;
                    const newPrimaryContact = primaryContactForEmail.createdAt > primaryContactForPhone.createdAt ? primaryContactForEmail : primaryContactForPhone;

                    // update all contacts where primary contact is new
                    await contactRepo.update({
                        linkedContact: {
                            id: newPrimaryContact.id
                        },
                    }, {
                        linkedContact: olderPrimaryContact
                    })

                    // update the precedence and linked contact of new primary contact
                    await contactRepo.update({
                        id: newPrimaryContact.id
                    }, {
                        linkedContact: olderPrimaryContact,
                        linkPrecedence: LinkPrecedenceEnum.SECONDARY
                    })

                    return fetchLinkedContacts(olderPrimaryContact)
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}