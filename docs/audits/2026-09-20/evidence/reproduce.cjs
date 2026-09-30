const path = require('node:path');
const repo = process.cwd();
const {createRequire} = require('node:module');
const req = createRequire(path.join(repo,'server/package.json'));
const {ValidationPipe} = req('@nestjs/common');
const {JwtService} = req('@nestjs/jwt');
const {UserService} = require(path.join(repo,'server/dist/src/user/services/user.service.js'));
const {TestsService} = require(path.join(repo,'server/dist/src/learning/services/tests.service.js'));
const {SubmitTestDto} = require(path.join(repo,'server/dist/src/learning/dto/submit-test.dto.js'));
const {UserDto} = require(path.join(repo,'server/dist/src/user/dto/user.dto.js'));
const {JwtStrategy} = require(path.join(repo,'server/dist/src/auth/jwt.strategy.js'));
const {evaluatePhishingAnswer} = require(path.join(repo,'server/dist/src/learning/answers/task-answer.evaluator.js'));
const pipe = new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true});
(async()=>{
 let user={id:'synthetic-user',email:'old@example.invalid',emailVerifiedAt:new Date(),status:'ACTIVE',password:'unused'};
 const us=new UserService({user:{findUnique:async()=>user,update:async({data})=>{user={...user,...data};return user;}}});
 const dto=await pipe.transform({email:'unverified@example.invalid'},{type:'body',metatype:UserDto});
 await us.update(user.id,dto);
 const strategy=new JwtStrategy({get:k=>k==='JWT_SECRET'?'synthetic-access-secret-123456789':'synthetic-refresh-secret-123456789'},us);
 const accepted=await strategy.validate({id:user.id,type:'access'});
 console.log(JSON.stringify({test:'email-change-without-reverification',changed:user.email==='unverified@example.invalid',verifiedStillPresent:!!user.emailVerifiedAt,jwtAccepted:!!accepted}));
 const questions=Array.from({length:5},(_,i)=>({id:'q'+i,type:'SINGLE_CHOICE',options:[{id:'a'+i,isCorrect:true}]}));
 const ts=new TestsService({checkAndAwardAchievements:async()=>[]},{test:{findUnique:async()=>({id:'test',questions,passingScore:80,course:{id:'course'}})},testResult:{create:async({data})=>data}});
 ts.checkAndIssueCertificate=async()=>null;
 for(const n of [1,5,6]){
  const td=await pipe.transform({answers:Array.from({length:n},()=>({questionId:'q0',selectedOptionIds:['a0']})),time:10},{type:'body',metatype:SubmitTestDto});
  const result=await ts.submitTest('test','user',td);
  console.log(JSON.stringify({test:'duplicate-question',repetitions:n,score:result.score,passed:result.passed}));
 }
 const meta={redFlags:[{id:'one',location:'body',span:'enter password',reason:'credential request'},{id:'two',location:'body',span:'urgent',reason:'urgency'}]};
 console.log(JSON.stringify({test:'whole-message-highlight',...evaluatePhishingAnswer(meta,[{location:'body',text:'Hello legitimate context with ordinary words. Urgent: enter password. More completely innocent context.'}])}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
