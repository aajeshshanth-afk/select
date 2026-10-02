(function(){
  const KEY='selecticore-v12';
  const defaults={schema:13,done:0,tests:[],errors:[],scores:{math:0,reading:0,thinking:0,writing:0},bestScores:{math:0,reading:0,thinking:0,writing:0},topicStats:{},writingHistory:[],typingHistory:[],streak:{days:0,last:null},lastActivity:null,events:[],typingStats:{attempts:0,bestWpm:0,bestAccuracy:0,avgWpm:0,avgAccuracy:0,completed:0,completedRate:0,bestTest:null}};
  function normalise(raw){
    raw=raw||{};
    return {...defaults,...raw,schema:13,
      bestScores:{...defaults.bestScores,...(raw.bestScores||{})},events:Array.isArray(raw.events)?raw.events.slice(0,300):[],
      scores:{...defaults.scores,...(raw.scores||{})},
      tests:Array.isArray(raw.tests)?raw.tests:[],errors:Array.isArray(raw.errors)?raw.errors:[],
      topicStats:raw.topicStats||{},writingHistory:Array.isArray(raw.writingHistory)?raw.writingHistory:[],typingHistory:Array.isArray(raw.typingHistory)?raw.typingHistory:[],typingStats:{attempts:0,bestWpm:0,bestAccuracy:0,avgWpm:0,avgAccuracy:0,completed:0,completedRate:0,bestTest:null,...(raw.typingStats||{})},
      streak:{...defaults.streak,...(raw.streak||{})}};
  }
  function read(){
    try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(raw)return normalise(raw);}catch(e){}
    try{const old=JSON.parse(localStorage.getItem('selecticore-v11')||localStorage.getItem('selecticore-v10')||localStorage.getItem('selecticore-v9')||localStorage.getItem('selecticore-v8')||localStorage.getItem('selecticore-v7')||localStorage.getItem('selecticore-v6')||localStorage.getItem('selecticore-v5')||localStorage.getItem('selecticore-v4')||localStorage.getItem('selecticore-v3')||localStorage.getItem('selecticore-v2')||'null');if(old){const s=normalise(old);write(s);return s;}}catch(e){}
    return normalise(null);
  }
  function write(s){try{localStorage.setItem(KEY,JSON.stringify(normalise(s)));}catch(e){} return s;}
  function touch(s){const today=new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).split('/').reverse().join('-');const last=s.streak.last;
    if(last!==today){let days=s.streak.days||0;if(last){const d=(new Date(today)-new Date(last))/86400000;days=d===1?days+1:1}else days=1;s.streak={days,last:today};}
    s.lastActivity=new Date().toISOString();return s;
  }
  function recordQuestion(s,q,correct,chosen,elapsed,reason){
    s=touch(s);const key=q.subject+'::'+q.topic;const st=s.topicStats[key]||{subject:q.subject,topic:q.topic,attempts:0,correct:0,totalTime:0};
    st.attempts++;st.totalTime+=Math.max(1,Number(elapsed)||1);if(correct)st.correct++;s.topicStats[key]=st;
    if(!correct&&q.question_type!=='open_response'){
      const existing=s.errors.find(e=>e.id===q.id);
      const item={id:q.id,question:q.question,options:q.options,your:q.options?.[chosen]??'No answer',correct:q.options?.[q.answer]??'',topic:q.topic,subject:q.subject,difficulty:q.difficulty,time_seconds:Math.max(1,Number(elapsed)||1),reason:reason||existing?.reason||'Review strategy',strategy:q.skill,explanation:q.explanation,status:'Unfixed',attempts:(existing?.attempts||0)+1,date:new Date().toISOString()};
      if(existing)Object.assign(existing,item);else s.errors.unshift(item);
    }
    write(s);return s;
  }
  function resolveError(s,id){const e=s.errors.find(x=>x.id===id);if(e){e.status='Mastered';e.masteredAt=new Date().toISOString();e.attempts=(e.attempts||1)+1;}return write(s);}
  function recordTyping(s,item){s=touch(s);const id=item.id||(`typing-${Date.now()}`);const entry={...item,id,subject:"typing",date:item.date||new Date().toISOString(),completed:!!item.completed};s.typingHistory=Array.isArray(s.typingHistory)?s.typingHistory:[];s.typingHistory.unshift(entry);s.typingHistory=s.typingHistory.slice(0,500);s.typingStats=s.typingStats||{attempts:0,bestWpm:0,bestAccuracy:0,avgWpm:0,avgAccuracy:0,completed:0,completedRate:0,bestTest:null};s.typingStats.attempts++;if(entry.completed)s.typingStats.completed++;s.typingStats.bestWpm=Math.max(s.typingStats.bestWpm,Number(item.wpm)||0);s.typingStats.bestAccuracy=Math.max(s.typingStats.bestAccuracy,Number(item.accuracy)||0);s.typingStats.avgWpm=Math.round(s.typingHistory.reduce((a,x)=>a+(Number(x.wpm)||0),0)/s.typingHistory.length);s.typingStats.avgAccuracy=Math.round(s.typingHistory.reduce((a,x)=>a+(Number(x.accuracy)||0),0)/s.typingHistory.length);s.typingStats.completedRate=Math.round((s.typingStats.completed/s.typingStats.attempts)*100);const best=s.typingStats.bestTest;if(!best||Number(item.wpm||0)>Number(best.wpm||0)||(Number(item.wpm||0)===Number(best.wpm||0)&&Number(item.accuracy||0)>Number(best.accuracy||0)))s.typingStats.bestTest={test_number:item.test_number,difficulty:item.difficulty,wpm:Number(item.wpm)||0,accuracy:Number(item.accuracy)||0,date:entry.date};logEvent(s,"typing_test",{id,test_number:item.test_number,wpm:item.wpm||0,accuracy:item.accuracy||0,completed:entry.completed});return write(s);}
  function recordWriting(s,item){
    s=touch(s);
    const pct=Math.max(0,Math.min(100,Number(item.practice_pct)||0));
    const id=String(item.id||('LAB-'+Date.now()));
    const entry={...item,id,subject:'writing',practice_pct:pct,date:item.date||new Date().toISOString()};
    s.writingHistory=Array.isArray(s.writingHistory)?s.writingHistory:[];
    const existing=s.writingHistory.find(x=>x.id===id && x.response===entry.response);
    if(existing){
      const oldPct=Number(existing.practice_pct)||0, oldTime=Number(existing.time_seconds)||1;
      Object.assign(existing,entry);
      const topic=entry.topic||'Creative writing', key='writing::'+topic;
      const st=s.topicStats[key]||{subject:'writing',topic,attempts:0,correct:0,totalTime:0,totalPct:0};
      st.totalPct=Math.max(0,(st.totalPct||0)-oldPct+pct);
      st.totalTime=Math.max(1,(st.totalTime||0)-oldTime+Math.max(1,Number(entry.time_seconds)||1));
      st.correct=st.attempts?Math.round(st.attempts*(st.totalPct/st.attempts)/100):0;
      st.last_pct=pct; st.avgPct=st.attempts?Math.round(st.totalPct/st.attempts):0; s.topicStats[key]=st;
    } else {
      s.writingHistory.unshift(entry);
      const topic=entry.topic||'Creative writing', key='writing::'+topic;
      const st=s.topicStats[key]||{subject:'writing',topic,attempts:0,correct:0,totalTime:0,totalPct:0};
      st.attempts++; st.totalTime+=Math.max(1,Number(entry.time_seconds)||1); st.totalPct+=pct;
      st.correct=Math.round(st.attempts*(st.totalPct/st.attempts)/100); st.last_pct=pct; st.avgPct=Math.round(st.totalPct/st.attempts); s.topicStats[key]=st;
    }
    s.writingHistory=s.writingHistory.slice(0,100);
    logEvent(s,'writing_review',{id,score:pct,topic:entry.topic||'Creative writing'});
    write(s);return s;
  }
  function setErrorReason(s,id,reason){const e=s.errors.find(x=>x.id===id);if(e){e.reason=reason;e.reason_updated_at=new Date().toISOString();}return write(s);}
  function logEvent(s,type,data){s.events=Array.isArray(s.events)?s.events:[];s.events.unshift({type,...data,date:new Date().toISOString()});s.events=s.events.slice(0,300);return s;}
  function finishTest(s,meta){s=touch(s);meta={...meta,session_id:meta.session_id||('S-'+Date.now()),completed_at:meta.completed_at||new Date().toISOString()};s.done++;s.tests.unshift(meta);s.tests=s.tests.slice(0,200);if(meta.subject&&meta.subject!=='mixed'&&Number.isFinite(meta.score)){const score=Math.max(0,Math.min(100,Number(meta.score)));s.scores[meta.subject]=Math.round((s.scores[meta.subject]||0)*.25+score*.75);s.bestScores[meta.subject]=Math.max(Number(s.bestScores[meta.subject])||0,score);}logEvent(s,'test_complete',{subject:meta.subject||'mixed',score:Number.isFinite(meta.score)?meta.score:null,mode:meta.mode||'practice'});return write(s);}
  function recommendations(s){return Object.values(s.topicStats).filter(x=>x.attempts>=2).map(x=>({...x,accuracy:x.correct/x.attempts,time:x.totalTime/x.attempts,mastery:x.correct>=5&&x.correct/x.attempts>=.85})).sort((a,b)=>a.mastery-b.mastery||a.accuracy-b.accuracy||b.time-a.time).slice(0,8);}
  function topicMastery(s,subject){return Object.values(s.topicStats).filter(x=>!subject||x.subject===subject).map(x=>({...x,accuracy:x.attempts?x.correct/x.attempts:0,avgTime:x.attempts?x.totalTime/x.attempts:0,mastered:x.correct>=5&&x.correct/x.attempts>=.85}));}
  function readiness(s){const subjects=['reading','math','thinking','writing'];const out={};subjects.forEach(k=>{const st=subjectStats(s,k);out[k]={...st,mastery:topicMastery(s,k).filter(x=>x.mastered).length,topics:topicMastery(s,k).length};});return out;}
  function achievements(s){const a=[];if((s.done||0)>=1)a.push('First test');if((s.done||0)>=10)a.push('10 tests');if((s.streak?.days||0)>=7)a.push('7-day streak');if((s.errors||[]).some(e=>e.status==='Mastered'))a.push('First mastered error');if((s.writingHistory||[]).length>=5)a.push('5 writing reviews');return a;}
  function subjectStats(s,subject){const tests=s.tests.filter(t=>t.subject===subject&&Number.isFinite(t.score));if(subject==='writing'){const writing=(s.writingHistory||[]).filter(x=>Number.isFinite(x.practice_pct));const avg=writing.length?Math.round(writing.reduce((a,x)=>a+x.practice_pct,0)/writing.length):0;const topics=Object.values(s.topicStats).filter(t=>t.subject==='writing');const attempts=writing.length,correct=writing.filter(x=>x.practice_pct>=70).length;return {tests:writing,avg,attempts,correct,accuracy:avg,writing:true};}const avg=tests.length?Math.round(tests.reduce((a,t)=>a+t.score,0)/tests.length):0;const topics=Object.values(s.topicStats).filter(t=>t.subject===subject);const attempts=topics.reduce((a,t)=>a+t.attempts,0),correct=topics.reduce((a,t)=>a+t.correct,0);return {tests,avg,attempts,correct,accuracy:attempts?Math.round(correct/attempts*100):0,writing:false};}
  function overall(s){const vals=Object.keys(s.scores).map(k=>Number(s.scores[k])||0).filter(v=>v>0);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;}
  function weeklyActivity(s){const cutoff=Date.now()-7*86400000;return s.tests.filter(t=>new Date(t.date||0).getTime()>=cutoff).length+s.writingHistory.filter(t=>new Date(t.date||0).getTime()>=cutoff).length+s.typingHistory.filter(t=>new Date(t.date||0).getTime()>=cutoff).length;}
  function errorSummary(s){const e=s.errors||[];return {total:e.length,unfixed:e.filter(x=>x.status!=='Mastered').length,mastered:e.filter(x=>x.status==='Mastered').length};}
  function recentActivity(s,limit=12){return [...(s.tests||[]).map(x=>({...x,activity_type:'test'})),...(s.writingHistory||[]).map(x=>({...x,activity_type:'writing'})),...(s.typingHistory||[]).map(x=>({...x,activity_type:'typing'}))].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).slice(0,limit);}
  function adaptivePlan(s){
    const weak=(s.errors||[]).filter(e=>e.status!=='Mastered').slice(0,6).map(e=>({type:'error',subject:e.subject,topic:e.topic,reason:e.reason||'Review strategy',id:e.id,difficulty:e.difficulty||'Selective'}));
    const topics=Object.values(s.topicStats||{}).filter(x=>x.attempts>=2).map(x=>({...x,accuracy:x.correct/x.attempts,avgTime:x.totalTime/x.attempts}));
    const weakTopics=topics.filter(x=>x.accuracy<.75).sort((a,b)=>a.accuracy-b.accuracy||b.avgTime-a.avgTime).slice(0,6).map(x=>({type:'topic',subject:x.subject,topic:x.topic,accuracy:Math.round(x.accuracy*100),avgTime:Math.round(x.avgTime),attempts:x.attempts}));
    const slow=topics.filter(x=>x.attempts>=3&&x.accuracy>=.75).sort((a,b)=>b.avgTime-a.avgTime).slice(0,3).map(x=>({type:'speed',subject:x.subject,topic:x.topic,accuracy:Math.round(x.accuracy*100),avgTime:Math.round(x.avgTime),attempts:x.attempts}));
    return {errors:weak,weakTopics,slowTopics:slow,next:weak[0]||weakTopics[0]||slow[0]||null};
  }
  function typingByDifficulty(s){
    const out={};['Standard','Advanced','Challenge'].forEach(d=>{const a=(s.typingHistory||[]).filter(x=>x.difficulty===d);out[d]={attempts:a.length,completed:a.filter(x=>x.completed).length,avgWpm:a.length?Math.round(a.reduce((n,x)=>n+(Number(x.wpm)||0),0)/a.length):0,avgAccuracy:a.length?Math.round(a.reduce((n,x)=>n+(Number(x.accuracy)||0),0)/a.length):0,completion:a.length?Math.round(a.filter(x=>x.completed).length/a.length*100):0};});return out;
  }
  function backup(){return JSON.stringify(read(),null,2);}
  function restore(raw){const parsed=typeof raw==='string'?JSON.parse(raw):raw;return write(parsed);}
  function subjectProgress(s,subject){const st=subjectStats(s,subject);const mastered=topicMastery(s,subject).filter(x=>x.mastered).length;const weak=recommendations(s).filter(x=>x.subject===subject).slice(0,3);return {...st,masteredTopics:mastered,weakTopics:weak};}
  window.SelectiCore={KEY,read,write,recordQuestion,recordWriting,recordTyping,setErrorReason,resolveError,finishTest,recommendations,adaptivePlan,typingByDifficulty,subjectStats,subjectProgress,topicMastery,readiness,achievements,overall,weeklyActivity,errorSummary,recentActivity,backup,restore};
})();
