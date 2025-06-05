const { Contacts, Sequelize } = require('../models');
const { Op } = Sequelize;

// get all contacts in the same identity cluster
async function getClusterContacts(primaryId) {
  return Contacts.findAll({
    where: {
      [Op.or]: [
        { id: primaryId },
        { linkedId: primaryId }
      ]
    }
  });
}

// function to return oldest primary contact from a list
function getOldestPrimary(contacts) {
  return contacts.reduce((oldest, current) =>
    new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
  );
}

// main identify function
exports.identify = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'At least email or phoneNumber is required.' });
    }

    const phoneStr = phoneNumber ? String(phoneNumber) : null;

    // Find any matching contacts
    const existingContacts = await Contacts.findAll({
      where: {
        [Op.or]: [
          email ? { email } : null,
          phoneStr ? { phoneNumber: phoneStr } : null
        ].filter(Boolean)
      }
    });

    // ➤ No match → create a new primary
    if (existingContacts.length === 0) {
      const newContact = await Contacts.create({ email, phoneNumber: phoneStr, linkPrecedence: 'primary' });
      return res.status(200).json({
        contact: {
          primaryContactId: newContact.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneStr ? [phoneStr] : [],
          secondaryContactIds: []
        }
      });
    }

    // ➤ Find the oldest primary among matches
    let primaryContacts = existingContacts.filter(c => c.linkPrecedence === 'primary');
    let oldestPrimary;

    if (primaryContacts.length > 0) {
      oldestPrimary = getOldestPrimary(primaryContacts);
    } else {
      const primaryIds = [...new Set(existingContacts.map(c => c.linkedId))];
      const foundPrimaries = await Contacts.findAll({ where: { id: primaryIds } });
      oldestPrimary = getOldestPrimary(foundPrimaries);
    }

    // ➤ Consolidate other primaries under the oldest one
    const otherPrimaries = primaryContacts.filter(c => c.id !== oldestPrimary.id);
    for (const primary of otherPrimaries) {
      await primary.update({
        linkedId: oldestPrimary.id,
        linkPrecedence: 'secondary'
      });
      await Contacts.update(
        { linkedId: oldestPrimary.id },
        { where: { linkedId: primary.id } }
      );
    }

    // ➤ Load all linked contacts in this cluster
    let clusterContacts = await getClusterContacts(oldestPrimary.id);

    // ➤ Check if the incoming email/phone is new
    const emails = new Set(clusterContacts.map(c => c.email).filter(Boolean));
    const phones = new Set(clusterContacts.map(c => c.phoneNumber).filter(Boolean));
    const isNewEmail = email && !emails.has(email);
    const isNewPhone = phoneStr && !phones.has(phoneStr);

    if (isNewEmail || isNewPhone) {
      await Contacts.create({
        email,
        phoneNumber: phoneStr,
        linkedId: oldestPrimary.id,
        linkPrecedence: 'secondary'
      });
      clusterContacts = await getClusterContacts(oldestPrimary.id); // Refresh after new insert
    }

    // ➤ Prepare final response
    const uniqueEmails = [...new Set(clusterContacts.map(c => c.email).filter(Boolean))];
    const uniquePhones = [...new Set(clusterContacts.map(c => c.phoneNumber).filter(Boolean))];
    const secondaryIds = clusterContacts
      .filter(c => c.linkPrecedence === 'secondary' && c.linkedId === oldestPrimary.id)
      .map(c => c.id);

    return res.status(200).json({
      contact: {
        primaryContactId: oldestPrimary.id,
        emails: oldestPrimary.email
          ? [oldestPrimary.email, ...uniqueEmails.filter(e => e !== oldestPrimary.email)]
          : uniqueEmails,
        phoneNumbers: oldestPrimary.phoneNumber
          ? [oldestPrimary.phoneNumber, ...uniquePhones.filter(p => p !== oldestPrimary.phoneNumber)]
          : uniquePhones,
        secondaryContactIds: secondaryIds
      }
    });
  } catch (err) {
    console.error('Identify error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
