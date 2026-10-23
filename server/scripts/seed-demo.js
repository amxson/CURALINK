const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');
const specialties = ['General Practitioner','Neurologist','Cardiologist','ENT Specialist','Dermatologist','Pediatrician','Orthopedic Surgeon','Gynecologist','Psychiatrist','Ophthalmologist','Urologist','Oncologist','Endocrinologist','Gastroenterologist','Pulmonologist','Rheumatologist','Nephrologist','Hematologist','Physiotherapist','Radiologist'];
const Appointment = require('../models/appointmentModel');
const Lab = require('../models/labModel');
const Prescription = require('../models/prescriptionModel');
const Notification = require('../models/notificationModel');
const Contact = require('../models/contact');
const names = ['Abel','Beth','Caleb','Dalia','Elias','Fara','Gabriel','Hana','Isaac','Jada','Kaleb','Lena','Mika','Nora','Omar','Priya','Ruth','Samuel','Tara','Yonas','Amira','Daniel','Maya','Noah','Avery','Robin'];
const surnames=['Mekonnen','Bekele','Girma','Tadesse','Kebede','Tesfaye','Alemu','Getachew','Mengistu','Yohannes','Abebe','Haile','Desta','Assefa','Worku','Solomon','Fikre','Tsegaye','Muluneh','Abate','Mulugeta','Sisay','Belay','Birhanu','Demo','Demo'];
async function buildData() {
 const users=[],doctors=[],accounts=[];
 for(let i=0;i<26;i++){
  const role=i<20?'Doctor':i<24?'Patient':i===24?'Admin':'Technician'; const num=String(i<20?i+1:i-19).padStart(2,'0');
  const email=`${role.toLowerCase()}${num}@demo.curalink.example`;
  const password=`Cura-${role.slice(0,3)}${num}-${crypto.randomBytes(6).toString('base64url')}!`;
  const user={_id:new mongoose.Types.ObjectId(),firstname:names[i],lastname:surnames[i],email,password:await bcrypt.hash(password,10),role,age:i<20?30+i:24+i,gender:'',mobile:'',address:'Fictional demo account',status:i<20?'accepted':'active',createdAt:new Date(),updatedAt:new Date()};
  const avatar=`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="${['#e0f2fe','#dcfce7','#ede9fe','#fef3c7'][i%4]}"/><text x="80" y="98" text-anchor="middle" font-family="sans-serif" font-size="54" fill="#1e375a">${user.firstname[0]}${user.lastname[0]}</text></svg>`;user.pic='data:image/svg+xml;base64,'+Buffer.from(avatar).toString('base64');
  if(role==='Doctor')user.pic=`https://randomuser.me/api/portraits/${i%2?'women':'men'}/${21+i}.jpg`;
  users.push(user);accounts.push({name:`${user.firstname} ${user.lastname}`,role,specialty:specialties[i]||'',email,password});
  if(role==='Doctor')doctors.push({_id:new mongoose.Types.ObjectId(),userId:user._id,specialization:specialties[i],experience:3+(i%18),fees:300+(i%8)*100,isDoctor:true,createdAt:new Date(),updatedAt:new Date()});
 }
 const appointments=[],labs=[],prescriptions=[],notifications=[],contacts=[];
 const dateAt = offset => {const date=new Date();date.setUTCDate(date.getUTCDate()+offset);return date;};
 for(let i=0;i<40;i++){
  const patient=users[20+i%4],doctor=users[i%20],when=dateAt(i<28?i-35:i-25);
  const appointment={_id:new mongoose.Types.ObjectId(),userId:patient._id,doctorId:doctor._id,date:when.toISOString().slice(0,10),time:`${String(9+i%7).padStart(2,'0')}:00`,status:i<28?'Completed':i%3?'Accepted':'Pending',createdAt:dateAt(i-42),updatedAt:when};
  if(i%2===0){appointment.opdType=i%4?'General':'Specialist';appointment.roomNumber=String(101+i%12);}
  appointments.push(appointment);
  notifications.push({_id:new mongoose.Types.ObjectId(),userId:patient._id,content:`Demo: your appointment with Dr. ${doctor.firstname} ${doctor.lastname} is ${appointment.status.toLowerCase()}.`,createdAt:when,updatedAt:when});
  if(i<8){
   const ready=i<5;const report=`CuraLink fictional demo report. Patient: ${patient.firstname} ${patient.lastname}. Test: routine screening. Demonstration only; no clinical findings.`;
   labs.push({_id:new mongoose.Types.ObjectId(),orderId:`DEMO-LAB-${1001+i}`,patientId:patient._id,doctorId:doctor._id,testName:i%2?'Routine blood screening (demo)':'Annual wellness screening (demo)',category:'Blood Work',description:'Fictional demonstration lab order.',status:ready?'Ready':'Pending',...(ready?{technicianId:users[25]._id,testResult:'Demonstration result. No real patient findings.',resultFile:'data:text/plain;base64,'+Buffer.from(report).toString('base64'),resultFileName:`demo-report-${i+1}.txt`}:{}),createdAt:when,updatedAt:when});
  }
  if(i<8)prescriptions.push({_id:new mongoose.Types.ObjectId(),userId:patient._id,doctorId:doctor._id,appointmentId:appointment._id,medicines:[{name:'Demo item (not a medication)',dosage:'Demonstration only',frequency:'Not for clinical use',duration:'Demo record'}],createdAt:when,updatedAt:when});
 }
 for(let i=0;i<4;i++)contacts.push({_id:new mongoose.Types.ObjectId(),userId:users[20+i]._id,name:users[20+i].firstname+' '+users[20+i].lastname,email:users[20+i].email,message:['Demo: how can I reschedule my upcoming appointment?','Demo: thank you for the simple appointment booking experience.','Demo: where can I find my laboratory report?','Demo: I would like to ask about specialist availability.'][i],date:dateAt(-i),createdAt:dateAt(-i),updatedAt:dateAt(-i)});
 return {users,doctors,accounts,appointments,labs,prescriptions,notifications,contacts};
}
async function main(){
 const output=path.resolve(process.argv[2]||'demo-output');
 await fs.mkdir(output,{recursive:true});
 const data=await buildData();
 // No live writes unless explicitly requested with --insert.
 if(process.argv.includes('--insert')){
  if(!process.env.MONGO_URI)throw new Error('Set MONGO_URI in your environment before inserting demo accounts');
  await mongoose.connect(process.env.MONGO_URI,{serverSelectionTimeoutMS:15000});
  if(await User.exists({email:{$in:data.accounts.map(a=>a.email)}}))throw new Error('Demo accounts already exist; refusing to replace passwords');
  const session=await mongoose.startSession();
  try {await session.withTransaction(async()=>{for(const [model,key] of [[User,'users'],[Doctor,'doctors'],[Appointment,'appointments'],[Lab,'labs'],[Prescription,'prescriptions'],[Notification,'notifications'],[Contact,'contacts']])await model.insertMany(data[key],{session});});}finally{await session.endSession();}
  console.log('Inserted 20 doctors, 4 patients, 2 staff, 40 appointments, 8 labs, 8 prescriptions and 40 notifications.');
 }
 const ejson = (_,value) => value;
 const encode = docs => JSON.stringify(docs.map(doc=>Object.fromEntries(Object.entries(doc).map(([k,v])=>[k,v instanceof mongoose.Types.ObjectId?{$oid:v.toString()}:v instanceof Date?{$date:v.toISOString()}:v]))),ejson,2);
 await fs.writeFile(path.join(output,'users.json'),encode(data.users));
 await fs.writeFile(path.join(output,'doctors.json'),encode(data.doctors));
 for(const key of ['appointments','labs','prescriptions','notifications','contacts'])await fs.writeFile(path.join(output,key+'.json'),encode(data[key]));
 await fs.writeFile(path.join(output,'accounts.csv'),'Name,Role,Specialty,Email,Password\n'+data.accounts.map(a=>[a.name,a.role,a.specialty,a.email,a.password].map(v=>'"'+v.replace(/"/g,'""')+'"').join(',')).join('\n')+'\n');
 await fs.writeFile(path.join(output,'accounts.json'),JSON.stringify(data.accounts,null,2));
 console.log('Demo payloads and private login list prepared in '+output);
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>mongoose.disconnect());
module.exports={buildData};
