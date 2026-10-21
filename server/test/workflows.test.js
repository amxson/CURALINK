const {test} = require('node:test');
const assert = require('node:assert/strict');
const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

test('CuraLink patient, staff, appointment, lab and prescription workflows', {timeout:180000}, async () => {
  const db = await MongoMemoryServer.create();
  process.env.MONGO_URI = db.getUri();
  process.env.JWT_SECRET_KEY = 'isolated-test-signing-secret';
  process.env.SESSION_SECRET = 'isolated-session-secret';
  delete process.env.GEMINI_API_KEY;
  const app = require('../server');
  await require('../db/conn')();
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const User = require('../models/userModel');
  const id = () => new mongoose.Types.ObjectId();
  const token = (user) => jwt.sign({userId: String(user._id), role:user.role}, process.env.JWT_SECRET_KEY, {expiresIn:'1h'});
  async function request(path, method='GET', body, auth) {
    const response = await fetch(base + '/api/' + path, {method, headers:{'Content-Type':'application/json', ...(auth ? {Authorization:`Bearer ${auth}`} : {})}, ...(body ? {body:JSON.stringify(body)} : {})});
    const text = await response.text(); let data; try {data=JSON.parse(text);} catch {data=text;}
    return {status:response.status, data};
  }
  try {
    const admin = await User.create({firstname:'Admin',lastname:'Tester',email:'admin@example.test',password:'test-only',role:'Admin'});
    const a = token(admin);
    const patient = {firstname:'Patient',lastname:'Tester',email:'patient@example.test',password:'Testpass123',role:'Patient'};
    assert.equal((await request('user/register','POST',patient)).status,201);
    assert.equal((await request('user/register','POST',{...patient,email:'bad@example.test',role:'Admin'})).status,403);
    const login = await request('user/login','POST',{email:patient.email,password:patient.password});
    assert.equal(login.status,200); const p = login.data.token;
    const patientId = jwt.decode(p).userId;
    assert.equal((await request('user/add-staff','POST',{},p)).status,403);
    for (const role of ['Doctor','Technician']) {
      assert.equal((await request('user/add-staff','POST',{firstname:role,lastname:'Tester',email:role+'@example.test',password:'Testpass123',role,specialization:'Cardiologist'},a)).status,201);
    }
    const doctor = await User.findOne({role:'Doctor'}); const d=token(doctor);
    const tech = await User.findOne({role:'Technician'}); const t=token(tech);
    const directory=await request('doctor/getalldoctors'); assert.equal(directory.data.doctors.length,1);
    const booking=await request('appointment/opd/create','POST',{doctorId:String(doctor._id),doctorname:'Doctor Tester',date:'2027-01-15',time:'10:00',opdType:'Cardiology'},p);
    assert.equal(booking.status,201);
    assert.equal((await request('appointment/status','PUT',{appointid:booking.data._id,status:'Accepted'},d)).status,200);
    const unrelated=jwt.sign({userId:String(id()),role:'Patient'},process.env.JWT_SECRET_KEY);
    assert.equal((await request('appointment/discard','DELETE',{appointid:booking.data._id},unrelated)).status,403);
    const labs=await request('lab/request','POST',{patientId,testName:'Blood test',category:'Blood Work',description:'Fictional test'},d);
    assert.equal(labs.status,201); const labId=labs.data.newTest._id;
    assert.equal((await request('lab/upload-result','PUT',{labId,testResult:'Test complete',resultFile:'data:text/plain;base64,dGVzdA==',resultFileName:'test.txt'},t)).status,200);
    assert.equal((await request('lab/download/'+labId,'GET',null,p)).data.fileName,'test.txt');
    assert.equal((await request('lab/download/'+labId,'GET',null,unrelated)).status,403);
    assert.equal((await request('prescription/create','POST',{userId:patientId,appointmentId:booking.data._id,medicines:[{name:'Fictional medicine',dosage:'test',frequency:'test',duration:'test'}]},d)).status,201);
    assert.equal((await request('prescription/patient/'+patientId,'GET',null,p)).data.length,1);
    assert.equal((await request('lab/patient/'+patientId,'GET',null,unrelated)).status,403);
    assert.equal((await request('user/updateprofile','PUT',{role:'Admin',firstname:'Updated'},p)).status,200);
    assert.equal((await User.findById(patientId)).role,'Patient');
    assert.equal((await request('chat','POST',{prompt:42})).status,400);
    assert.equal((await request('chat','POST',{prompt:'chest pain'})).status,200);
    assert.equal((await request('chat','POST',{prompt:'Find a department'})).status,503);
    assert.equal((await request('health')).data.database,'connected');
  } finally {await new Promise(resolve=>server.close(resolve)); await mongoose.disconnect(); await db.stop();}
});

