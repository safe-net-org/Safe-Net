import fs from 'node:fs/promises';
import path from 'node:path';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {resolvePresentationFont,finalizePresentation} from '/Users/artem/.codex/plugins/cache/openai-primary-runtime/presentations/26.921.10847/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root=process.cwd(), dir=path.join(root,'_archive/presentation-build'), out=path.join(root,'docs/presentation/output');
const skill='/Users/artem/.codex/plugins/cache/openai-primary-runtime/presentations/26.921.10847/skills/presentations';
const py='/Users/artem/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const font=resolvePresentationFont(); console.log('Font',font);
const C={navy:'#101E2C',ink:'#162C3D',paper:'#F5F3EE',muted:'#53616A',green:'#B7E6C2',teal:'#247A64',red:'#B74035',line:'#CAD3CF',white:'#FFFFFF'};
const p=Presentation.create({slideSize:{width:1280,height:720}});
let num=0;
function txt(s,text,x,y,w,h,size=28,color=C.ink,bold=false){let a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}}); a.text=text; a.text.style={typeface:font,fontSize:size,bold,color,autoFit:'none',wrap:true,insets:{left:0,right:0,top:0,bottom:0}};return a;}
function line(s,x,y,w,color=C.line){s.shapes.add({geometry:'line',position:{left:x,top:y,width:w,height:0},fill:'none',line:{fill:color,width:1}});}
function slide(title,notes='',dark=false){let s=p.slides.add();s.background.fill=dark?C.navy:C.paper;num++; if(title)txt(s,title,64,54,1150,94,46,dark?C.white:C.ink,true); txt(s,String(num).padStart(2,'0'),1170,665,48,24,16,dark?C.green:C.muted);s.speakerNotes.textFrame.setText(notes);return s;}
function desc(s,head,body,x,y,w=480,dark=false){txt(s,head,x,y,w,40,28,dark?C.green:C.teal,true);txt(s,body,x,y+52,w,130,27,dark?C.white:C.ink);}
function node(s,label,sub,x,y,w=280,h=110){let a=s.shapes.add({geometry:'rect',position:{left:x,top:y,width:w,height:h},fill:C.paper,line:{fill:C.teal,width:1.2}});txt(s,label,x+18,y+16,w-36,36,27,C.ink,true);txt(s,sub,x+18,y+57,w-36,h-62,20,C.muted);return a;}
function join(s,a,b,from='right',to='left',dash=false){s.shapes.connect(a,b,{kind:'elbow',fromSide:from,toSide:to,line:{fill:C.teal,width:2,...(dash?{style:'dash'}:{})}});}
const repo='https://github.com/safe-net-org/Safe-Net';
const src='Local source commit 8d1b2dc. Evidence: docs/audits/LOCAL_VERIFICATION_2026-09-30.md. Repository: '+repo;
let s=slide('', 'Safe-Net is a local engineering prototype. This deck requests methodological feedback. It does not claim a deployed service, independent detection accuracy or a completed study. Presenter: Artem, high-school student. '+src,true);
txt(s,'Safe-Net',64,145,1090,150,116,C.white,true);
txt(s,'Cybersecurity learning with\nexplainable URL warnings',70,322,1000,140,44,C.green);
txt(s,'Artem  /  Student project  /  September 2026',70,574,1100,44,24,C.white);
s=slide('The research question','Hypothesis only. No human study or learning-gain measurement has been conducted. Protocol: docs/RESEARCH_PROTOCOL_DRAFT.md.');
txt(s,'Can practice with explanations improve\nrecognition of unfamiliar phishing cues?',64,181,1138,170,56,C.ink,true);
line(s,64,408,1150);
txt(s,'Proposed comparison',64,452,390,40,26,C.teal,true);
txt(s,'Interactive practice versus an equal-duration text lesson.\nAssess new examples immediately and after a delay.',64,506,1100,106,31);
function mindmap(s){
 const center=node(s,'Safe-Net','Learn a cue. Explain a warning.',468,300,344,115);
 const learn=node(s,'Learning web app','EN/RU courses and simulations',64,173,318,112);
 const guard=node(s,'Guard extension','Local URL rules and explanations',898,173,318,112);
 const api=node(s,'Learning API','Auth and server-side grading',64,439,318,112);
 const rules=node(s,'Shared rule engine','Web scanner and extension',898,439,318,112);
 const db=node(s,'PostgreSQL','Per-user progress and certificates',64,568,430,85);
 const ml=node(s,'Optional ML service','Sanitized URL, opt-in model opinion',786,568,430,85);
 join(s,learn,center);join(s,center,guard);join(s,api,center);join(s,center,rules);join(s,api,db,'bottom','top');join(s,rules,ml,'bottom','top');
}
s=slide('How the system works', 'The diagram shows actual components. The learning API persists progress in PostgreSQL. The web scanner and extension import guard-core directly. The optional Python service mirrors the rules and can add a model opinion. It is not a shared binary. Sources: docs/ARCHITECTURE.md; packages/guard-core/src; extension/src; server/src.');mindmap(s);
s=slide('The learning experience',src+' The screenshot is a synthetic local learner completing the VPN course, not participant data. The correct answers were known for this engineering acceptance check. The 100% result measures the test flow, not learning improvement.');
await fs.access(path.join(root,'docs/audits/screenshots/local-final-test-20260930.jpg'));
s.images.add({blob:new Uint8Array(await fs.readFile(path.join(root,'docs/audits/screenshots/local-final-test-20260930.jpg'))),contentType:'image/jpeg',alt:'Actual local test results with per-question feedback',fit:'contain',position:{left:550,top:177,width:667,height:417}});
desc(s,'21 courses','27 lessons\n163 tasks\n21 final tests',64,178,410);
txt(s,'Verified local journey',64,437,420,40,26,C.teal,true);txt(s,'6 tasks completed\n8 test answers graded\n1 certificate issued',64,489,430,137,30);
s=slide('Server-side assessment','The phishing simulator sends selected field/text spans. The API evaluates answers against an answer key excluded from the learner payload. Completion and XP awards persist per user. Sources: server/src/learning/answers/task-answer.evaluator.ts; server/src/learning/services/progress.service.ts; tools/test-http-integration.cjs. Diagram is an illustrative flow, not a screenshot.');
const a=node(s,'Learner selection','Red flags in a safe simulation',64,220,330,125),b=node(s,'API evaluation','Protected answer key',474,220,330,125),c=node(s,'Saved result','Progress, XP, feedback',884,220,330,125);join(s,a,b);join(s,b,c);
txt(s,'A completed task belongs to the learner account',64,425,1150,68,40,C.ink,true);txt(s,'Database constraints prevent repeated XP and duplicate course certificates.\nA fresh tab reloads progress from the server.',64,527,1150,102,29);
s=slide('An explainable warning','Executed locally on 2026-09-30: scoreUrl(url, analyzeUrl(url)). Input https://micros0ft-alerts.com/login. Output score 88, level danger, signals brand_token_leet and suspicious_word. Sources: packages/guard-core/src/model/score.ts and src/lib/url-analyzer.ts. This synthetic example is not an independently labelled benchmark. Do not visit it.');
txt(s,'micros0ft-alerts.com/login',64,180,1140,85,53,C.ink,true);
txt(s,'88 / 100',64,325,430,105,76,C.red,true);txt(s,'Danger',68,442,390,55,35,C.red,true);
desc(s,'Why the rule fires','The domain embeds a brand with a zero\nin place of “o”. The path also contains\na suspicious word.',570,327,638);
txt(s,'Risk scores express product policy, not calibrated probabilities.',64,609,1120,42,24,C.muted);
s=slide('Privacy and model boundaries','Sources: extension/src/shared/lib/url-privacy.ts; extension/src/shared/i18n/messages.ts; ml-service/MODEL_CARD.md; packages/guard-core/src/model/blend.ts. Default local rule analysis. Optional model endpoint receives scheme, host, port, path and query names; removes credentials, query values and fragment. Host and path can still be sensitive. Upstream checkpoint is ealvaradob/bert-finetuned-phishing pinned to fa8fb73a007174c410ab7160d4e4c6e6b8d998d4. No claim that Artem trained BERT.');
desc(s,'Default: local rules','The browser can score URLs without\nsending them to the ML service.',64,190,530);
desc(s,'Optional: model opinion','Explicit opt-in sends a sanitized URL\nto the configured endpoint.',674,190,540);
line(s,64,431,1150);txt(s,'What remains in the optional request',64,466,1090,44,30,C.teal,true);txt(s,'Hostnames and paths still reveal information.\nThe BERT checkpoint comes from a third party.\nIndependent model evaluation remains open.',64,524,1120,135,28);
s=slide('Engineering evidence',src+' Counts are engineering checks, not scientific results. The 30 curated URLs test TypeScript/Python rule parity, not real-world accuracy. All configured local checks passed before these presentation-only files were created.',true);
txt(s,'98',64,177,420,135,112,C.green,true);txt(s,'API regression tests',69,319,470,45,29,C.white);
txt(s,'30',689,177,420,135,112,C.green,true);txt(s,'URLs in the rule parity corpus',694,319,510,76,29,C.white);
line(s,64,450,1150,C.muted);txt(s,'Local builds and package checks passed\nHTTP checks covered auth, grading and concurrency\nMailpit received EN/RU account emails',64,493,1150,150,30,C.white);
s=slide('What the evidence does not establish','No participants recruited, no human outcome dataset, no independent detector benchmark. Remaining release checks documented in FIX.md and docs/EVIDENCE_AND_LIMITATIONS.md. Local SMTP capture does not prove delivery to an external inbox. Installed Chrome extension behavior and hosted CI remain unverified.');
desc(s,'Research outcomes','No measured learning gains\nNo independent detection accuracy\nNo user study yet',64,196,520);
desc(s,'Release acceptance','Chrome installation and behavior\nExternal inbox delivery and hosted CI\nAccessibility and broader browser coverage',673,196,545);
line(s,64,452,1150);txt(s,'Current scope: a working local prototype',64,498,1110,64,40,C.ink,true);txt(s,'Suitable for technical feedback and study-design review.',64,579,1110,58,29);
s=slide('Proposed learning-transfer study','Design proposal, not approved or conducted research. Source: docs/RESEARCH_PROTOCOL_DRAFT.md. Random assignment and equal duration. Distinct domains and templates across baseline, immediate and delayed item sets. Delayed interval and sample size need justification before collection. Prefer an adult pilot with appropriate review/consent before minors. Freeze exclusions, missingness handling and primary outcome.');
const phases=[['Baseline','Unseen item bank A'],['Learning','Practice or text lesson'],['Immediate','Unseen item bank B'],['Delayed','Unseen item bank C']];let ns=phases.map((q,i)=>node(s,q[0],q[1],64+i*306,205,265,112));for(let i=0;i<3;i++)join(s,ns[i],ns[i+1]);
txt(s,'Primary outcome',64,401,1100,42,28,C.teal,true);txt(s,'Change in balanced accuracy on delayed, unfamiliar examples',64,458,1140,78,37,C.ink,true);txt(s,'Also report phishing recall, benign false alarms and attrition.\nSeparate item banks reduce memorization of repeated examples.',64,566,1140,89,27);
s=slide('A reproducible next contribution','Suggested independent detector experiment, not an existing result. Distinguish detector evaluation from the learner study. Public dataset release depends on licensing, safety and privacy. Do not publish live malicious links or personal information. All future outcome numbers must derive from actual analysis.');
desc(s,'Detector experiment','Build a versioned, independently labelled\nURL set with source-separated splits.',64,190,550);
desc(s,'Error analysis','Compare rules, optional model and blend.\nReport false positives by attack family\nand language.',674,190,540);
line(s,64,443,1150);txt(s,'Deliverable',64,478,1090,42,28,C.teal,true);txt(s,'An evaluation script, documented dataset procedure\nand a short report that explains failure cases.',64,534,1140,103,34);
s=slide('Feedback requested','This is a request for narrow methodological feedback, not a request for a recommendation, endorsement, admissions support or guaranteed supervision. Repo link is source entry point, not a claim that unpublished local fixes are visible on GitHub. Local source commit: 8d1b2dc.');
txt(s,'How should I distinguish learning transfer\nfrom memorizing familiar phishing cues?',64,192,1145,114,45,C.ink,true);
txt(s,'Which assessment design would make a small pilot credible?',64,373,1145,100,36);
txt(s,'Would error analysis or a learning study be the more useful next step?',64,500,1145,99,36);
txt(s,'Artem  /  High-school student  /  Safe-Net',64,637,1050,32,22,C.teal);
await fs.mkdir(out,{recursive:true});
async function finish(pres,name,count){const draft=path.join(dir,name+'.draft.pptx');await(await PresentationFile.exportPptx(pres)).save(draft);await finalizePresentation({workspaceDir:root,candidatePath:draft,finalPath:path.join(out,name+'.pptx'),pythonExecutable:py,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,explicitTotalSlideCount:count,receiptPath:path.join(dir,name+'.validation.json')});for(let i=0;i<count;i++){let bl=await pres.export({slide:pres.slides.getItem(i),format:'png',scale:1});await fs.writeFile(path.join(dir,name+'-'+String(i+1).padStart(2,'0')+'.png'),new Uint8Array(await bl.arrayBuffer()));}console.log('Exported',name);}
await finish(p,'Safe-Net_Professor_Review',12);
const m=Presentation.create({slideSize:{width:1280,height:720}});const ms=m.slides.add();ms.background.fill=C.paper;txt(ms,'Safe-Net: system mindmap',64,54,1150,85,46,C.ink,true);mindmap(ms);ms.speakerNotes.textFrame.setText('Editable component overview. Solid connections show relations between components, not deployment guarantees. Sources: docs/ARCHITECTURE.md and current source.');await finish(m,'Safe-Net_Mindmap',1);
await fs.copyFile(path.join(dir,'Safe-Net_Mindmap-01.png'),path.join(out,'Safe-Net_Mindmap.png'));
await fs.writeFile(path.join(root,'docs/presentation/source/slides-notes.json'),JSON.stringify(p.toProto(),null,2));
