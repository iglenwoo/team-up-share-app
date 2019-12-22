const functions = require('firebase-functions')
const admin = require('firebase-admin')
const serviceAccount = require('./private/key.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://team-up-share.firebaseio.com',
})

const firestore = admin.firestore()

exports.updateFileList = functions.storage.object().onFinalize(async (object) => {
  console.log('onFinalize object', object)
  const { project, fileName, updatedBy } = object.metadata

  firestore
    .collection('projects').doc(project)
    .collection('documents').doc(fileName).set({
      name: fileName,
      path: object.name,
      mediaLink: object.mediaLink,
      contextType: object.contentType,
      size: object.size,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: updatedBy
    })
})

exports.deleteFileList = functions.storage.object().onDelete(async (object) => {
  console.log('onDelete object', object)
  const { project, fileName } = object.metadata

  firestore
    .collection('projects').doc(project)
    .collection('documents').doc(fileName).delete()
})

exports.readProject = functions.https.onCall(async (data, context) => {
  const { code } = data
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
      'while authenticated.');
  }
  const email = context.auth.token.email || null;

  return firestore.collection('projects').doc(code).get().then(projectDoc => {
    const data = projectDoc.data()
    for (const member of data.members) {
      if (member.email === email) {
        return data
      }
    }
    throw new functions.https.HttpsError('permission-denied', 'You cannot access this project.');
  })
})

exports.addProject = functions.https.onCall(async (data, context) => {
  // Message text passed from the client.
  console.log(data)
  const { code, members, title, desc } = data

  // Authentication / user information is automatically added to the request.
  const uid = context.auth.uid;

  const projectRef = firestore.collection('projects').doc(code)
  const userRef = firestore.collection('users').doc(uid)
  return firestore
    .runTransaction(t => {
      return t.get(projectRef).then(projectDoc => {
        if (projectDoc.exists) {
          throw new functions.https.HttpsError('already-exists', `Project code ${code} already exists`)
        }

        t.set(projectRef, { code, members, title, desc })
        t.update(userRef, {
          projects: admin.firestore.FieldValue.arrayUnion(projectRef.id),
        })

        return {
          id: projectRef.id
        }
      })
    })
});
