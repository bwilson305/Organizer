import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDu6eyZB0wxjikxUQscABo9o54eRF-SEAY",
  authDomain: "organizer-2.firebaseapp.com",
  projectId: "organizer-2",
  storageBucket: "organizer-2.firebasestorage.app",
  messagingSenderId: "811858648505",
  appId: "1:811858648505:web:1c6b2f6332c89701036a68",
  measurementId: "G-XL3MQQSVSH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch and display contacts from Firestore
async function getContacts() {
  try {
      const querySnapshot = await getDocs(collection(db, "contacts"));
      const contactList = document.getElementById("contact-list");
      contactList.innerHTML = "";

      querySnapshot.forEach((doc) => {
          const contactData = doc.data();
          const listItem = document.createElement("li");
          let contactText = `${contactData.name} - ${contactData.email} - ${contactData.phone}`;

          if (contactData.tags && contactData.tags.length > 0) {
              contactText += " - Tags: ";
              contactData.tags.forEach((tag) => {
                  contactText += `${tag} <button onclick="deleteTag('${doc.id}', '${tag}')">x</button> `;
              });
              contactText += `<button onclick="editTags('${doc.id}', '${contactData.tags.join(', ')}')">Edit Tags</button>`
          }

          listItem.innerHTML = contactText;
          contactList.appendChild(listItem);
      });
  } catch (error) {
      console.error("Error fetching contacts:", error);
  }
}
function editTags(contactId, tagsString) {
  const newTags = prompt("Edit Tags (comma separated):", tagsString);
  if (newTags !== null) {
      const tags = newTags.split(",").map((tag) => tag.trim());
      updateDoc(doc(db, "contacts", contactId), { tags: tags })
          .then(() => getContacts())
          .catch((error) => console.error("Error updating tags:", error));
  }
}
function deleteTag(contactId, tagToDelete) {
  getDoc(doc(db, "contacts", contactId)).then((docSnapshot) => {
      if (docSnapshot.exists()) {
          const contactData = docSnapshot.data();
          const tags = contactData.tags.filter((tag) => tag !== tagToDelete);
          updateDoc(doc(db, "contacts", contactId), { tags: tags })
              .then(() => getContacts())
              .catch((error) => console.error("Error deleting tag:", error));
      }
  });
}
async function filterContacts() {
  const filterTag = document.getElementById("filter-tag").value.trim();

  if (filterTag) {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "contacts"), where("tags", "array-contains", filterTag))
      );
      const contactList = document.getElementById("contact-list");
      contactList.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const contactData = doc.data();
        const listItem = document.createElement("li");
        let contactText = `${contactData.name} - ${contactData.email} - ${contactData.phone}`;

        if (contactData.tags && contactData.tags.length > 0) {
          contactText += ` - Tags: ${contactData.tags.join(", ")}`;
        }

        listItem.textContent = contactText;
        contactList.appendChild(listItem);
      });
    } catch (error) {
      console.error("Error filtering contacts:", error);
    }
  } else {
    // If no tag is entered, display all contacts
    getContacts();
  }
}

document
.getElementById("filter-contacts-btn")
.addEventListener("click", filterContacts);

// Function to fetch and display projects from Firestore
async function getProjects() {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projectList = document.getElementById("project-list");
    projectList.innerHTML = "";

    for (const projectDoc of querySnapshot.docs) {
      const projectData = projectDoc.data();
      const listItem = document.createElement("li");
      listItem.textContent = projectData.name;

      // Fetch tasks for the project
      const tasksSnapshot = await getDocs(
        collection(db, "projects", projectDoc.id, "tasks")
      );
      const tasksList = document.createElement("ul");

      tasksSnapshot.forEach((taskDoc) => {
        const taskData = taskDoc.data();
        const taskItem = document.createElement("li");
        taskItem.textContent = taskData.name;
        tasksList.appendChild(taskItem);
      });

      listItem.appendChild(tasksList);
      projectList.appendChild(listItem);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
  linkContactsToProjects(); 
}
async function linkContactsToProjects() {
  try {
    const projectsSnapshot = await getDocs(collection(db, "projects"));

    for (const projectDoc of projectsSnapshot.docs) {
      const projectName = projectDoc.data().name;
      const contactsSnapshot = await getDocs(
        query(collection(db, "contacts"), where("tags", "array-contains", projectName))
      );

      const linkedContacts = [];
      contactsSnapshot.forEach((contactDoc) => {
        linkedContacts.push(contactDoc.data());
      });

      // Update project display
      const projectListItem = document.querySelector(
        `#project-list li:nth-child(${projectsSnapshot.docs.indexOf(projectDoc) + 1})`
      );

      if (projectListItem) {
        let linkedContactsHTML = "<ul>";
        linkedContacts.forEach((contact) => {
          linkedContactsHTML += `<li>${contact.name}</li>`;
        });
        linkedContactsHTML += "</ul>";
        projectListItem.innerHTML += linkedContactsHTML;
      }
    }
  } catch (error) {
    console.error("Error linking contacts to projects:", error);
  }

// Function to fetch and display templates from Firestore
async function getTemplates() {
  try {
    const querySnapshot = await getDocs(collection(db, "templates"));
    const templateList = document.getElementById("template-list");
    templateList.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const templateData = doc.data();
      const listItem = document.createElement("li");
      listItem.textContent = templateData.name;
      templateList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
  }
}

// Function to create a new template
async function createTemplate() {
  try {
    const templateName = document.getElementById("template-name").value;
    if (templateName) {
      await addDoc(collection(db, "templates"), {
        name: templateName,
        tasks: [], // Initialize with empty tasks for now
      });
      document.getElementById("template-name").value = ""; // Clear input
      getTemplates(); // Refresh template list
    }
  } catch (error) {
    console.error("Error creating template:", error);
  }
}

// Function to add a contact with tags
async function addContact() {
  const name = document.getElementById("contact-name").value;
  const email = document.getElementById("contact-email").value;
  const phone = document.getElementById("contact-phone").value;
  const address = document.getElementById("contact-address").value;
  const notes = document.getElementById("contact-notes").value;
  const tagsInput = document.getElementById("contact-tags").value;
  const tags = tagsInput.split(",").map((tag) => tag.trim()); // Split and trim tags

  try {
    await addDoc(collection(db, "contacts"), {
      name: name,
      email: email,
      phone: phone,
      address: address,
      notes: notes,
      tags: tags,
    });
    // Clear form fields
    document.getElementById("contact-name").value = "";
    document.getElementById("contact-email").value = "";
    document.getElementById("contact-phone").value = "";
    document.getElementById("contact-address").value = "";
    document.getElementById("contact-notes").value = "";
    document.getElementById("contact-tags").value = "";

    getContacts(); // Refresh contact list
  } catch (error) {
    console.error("Error adding contact:", error);
  }
}

// Event listeners
document
  .getElementById("create-template-btn")
  .addEventListener("click", createTemplate);

document
  .getElementById("add-contact-btn")
  .addEventListener("click", addContact);

// Call the functions to fetch data
getContacts();
getProjects();
getTemplates();
}

