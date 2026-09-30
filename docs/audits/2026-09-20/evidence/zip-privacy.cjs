const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const store={},events={},requests=[];
const evt=n=>({addListener:f=>events[n]=f});
const noop=async()=>{};
const browser={runtime:{id:'synthetic-extension',onMessage:evt('message')},storage:{local:{get:async k=>k===null?{...store}:{[k]:store[k]},set:async x=>Object.assign(store,x),remove:noop}},webNavigation:{onCommitted:evt('navigation'),onHistoryStateUpdated:evt('history')},tabs:{onRemoved:evt('removed'),sendMessage:noop,query:async()=>[]},action:{onClicked:evt('clicked'),setBadgeText:noop,setBadgeBackgroundColor:noop,setTitle:noop,setIcon:noop},commands:{onCommand:evt('command')}};
const source=execFileSync('unzip',['-p','client/public/downloads/safenet-guard-chrome.zip','background.js'],{encoding:'utf8'});
vm.runInNewContext(source,{browser,console,URL,AbortController,setTimeout,clearTimeout,fetch:async(url,opts)=>{requests.push({endpoint:url,body:JSON.parse(opts.body)});return {ok:false}}},{timeout:1000});
(async()=>{
 const canary='https://synthetic-user:synthetic-password@example.com/private?token=SYNTHETIC_CANARY#SYNTHETIC_FRAGMENT';
 await events.navigation({frameId:0,tabId:1,url:canary});
 await new Promise(r=>setImmediate(r));
 console.log(JSON.stringify({test:'download-zip-fresh-install-privacy',network:'mocked-no-real-network',requestCount:requests.length,requests,fullUrlLeaked:requests.some(r=>r.body.url===canary)}));
})().catch(e=>{console.error(e.message);process.exitCode=1});
