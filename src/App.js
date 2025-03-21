import React, { useState, useEffect } from 'react';
import { db, auth, googleProvider } from './firebase';
import { collection, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, TextField, Button, List, ListItem, ListItemText, Container } from '@mui/material';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', tags: '' });
  const [newProject, setNewProject] = useState('');
  const [newTask, setNewTask] = useState({ name: '', projectId: '', assignee: '', dueDate: '', parentTaskId: '' });
  const [newTemplate, setNewTemplate] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = () => {
    onSnapshot(collection(db, 'contacts'), (snap) => setContacts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    onSnapshot(collection(db, 'projects'), (snap) => setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    onSnapshot(collection(db, 'templates'), (snap) => setTemplates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    getDocs(collection(db, 'projects')).then(async (projSnap) => {
      const allTasks = [];
      for (const proj of projSnap.docs) {
        const tasksSnap = await getDocs(collection(db, 'projects', proj.id, 'tasks'));
        tasksSnap.forEach(task => allTasks.push({ id: task.id, projectId: proj.id, ...task.data() }));
      }
      setTasks(allTasks);
    });
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const addContact = async () => {
    await addDoc(collection(db, 'contacts'), { ...newContact, tags: newContact.tags.split(',').map(t => t.trim()), createdBy: user.uid });
    setNewContact({ name: '', email: '', phone: '', tags: '' });
    fetchData();
  };

  const addProject = async () => {
    await addDoc(collection(db, 'projects'), { name: newProject, createdBy: user.uid });
    setNewProject('');
    fetchData();
  };

  const addTask = async () => {
    const taskData = { 
      name: newTask.name, 
      assignee: newTask.assignee, 
      dueDate: newTask.dueDate, 
      parentTaskId: newTask.parentTaskId || null, 
      createdBy: user.uid 
    };
    await addDoc(collection(db, 'projects', newTask.projectId, 'tasks'), taskData);
    setNewTask({ name: '', projectId: '', assignee: '', dueDate: '', parentTaskId: '' });
    fetchData();
  };

  const addTemplate = async () => {
    await addDoc(collection(db, 'templates'), { name: newTemplate, tasks: [], createdBy: user.uid });
    setNewTemplate('');
    fetchData();
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>Login</Typography>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal" />
        <Button variant="contained" onClick={handleLogin} fullWidth>Login</Button>
      </Container>
    );
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Organizer</Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
          <Tab label="Contacts" />
          <Tab label="Projects" />
          <Tab label="Tasks" />
          <Tab label="Calendar" />
          <Tab label="Templates" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <div>
              <TextField label="Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} fullWidth margin="normal" />
              <TextField label="Email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} fullWidth margin="normal" />
              <TextField label="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} fullWidth margin="normal" />
              <TextField label="Tags (comma-separated)" value={newContact.tags} onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })} fullWidth margin="normal" />
              <Button variant="contained" onClick={addContact} fullWidth sx={{ mt: 2 }}>Add Contact</Button>
              <List>
                {contacts.map(contact => (
                  <ListItem key={contact.id}>
                    <ListItemText primary={contact.name} secondary={`${contact.email} | ${contact.phone} | ${contact.tags.join(', ')}`} />
                  </ListItem>
                ))}
              </List>
            </div>
          )}
        </Box>
      </Container>
    </div>
  );
}

export default App;