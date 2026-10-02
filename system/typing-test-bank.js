(()=>{
  const TYPING_META={version:"v69",count:16000,minutes:2,library:"professional-corpus-v3"};
  const settings=["the school library","the science room","the community garden","the museum gallery","the harbour walkway","the robotics workshop","the art studio","the sports oval","the local history centre","the reading room","the technology lab","the outdoor classroom","the neighbourhood centre","the geography room","the school courtyard","the rehearsal space","the makerspace","the environmental centre","the kitchen classroom","the quiet study area"];
  const subjects=["the science team","the reading group","the robotics club","the garden crew","the museum team","the class council","the geography group","the art team","the library volunteers","the sports committee","the coding group","the school reporters","the design team","the environmental club","the drama group","the student researchers","the community volunteers","the debating team","the technology class","the history group"];
  const tasks=["compare two sets of observations","check a sequence of instructions","organise notes for a short report","measure changes across several trials","review a plan before sharing it","sort evidence into useful categories","test a new method carefully","map the important details","edit a paragraph for clarity","record a result for later comparison","prepare materials for a practical task","identify the strongest clue in a problem","check a timetable for conflicts","summarise the main idea in clear language","compare several possible explanations","arrange information in a logical order"];
  const objects=["a marked ruler and a notebook","three labelled folders and a timer","a clipboard with yesterday's results","a map, pencil and reference card","a set of numbered cards","a small box of experiment materials","a checklist beside the computer","a collection of photographs and notes","a worksheet covered with careful annotations","a simple measuring tool and spare paper"];
  const observations=["one detail had been recorded twice","the quickest method was not the clearest","a small change produced a different result","two explanations fitted the first clue","an earlier note contained a useful warning","the order of the steps affected the outcome","one piece of evidence was less reliable than expected","the final answer depended on a precise definition","a missing label made the comparison harder","a careful reread revealed an overlooked condition"];
  const bridges=[
    "Before moving on, they paused to check that every important detail had been recorded.",
    "A short discussion helped the group decide which evidence deserved the closest attention.",
    "Once the information was placed in order, the next step became much easier to explain.",
    "The group then tested its assumption against one more example instead of relying on a guess.",
    "For a moment, everyone stopped working so the instructions could be read from beginning to end.",
    "The comparison became clearer after the students separated observations from conclusions.",
    "One useful question changed the discussion: what evidence would prove the idea wrong?",
    "They made a small adjustment and repeated the check before recording the final result.",
    "The room became quiet while each person reviewed the same information independently.",
    "A second method produced a similar result, giving the team more confidence in its conclusion.",
    "The next decision was easier because the group had already listed the possible problems.",
    "Instead of rushing ahead, they explained the previous step to a partner and found one small gap."
  ];
  const endings=[
    "By the end of the session, the method was clearer, the notes were easier to follow, and the next attempt had a definite starting point.",
    "The final record was not complicated, but it was precise enough for another student to repeat the process without extra help.",
    "Everyone left with one practical improvement to try next time and one question worth investigating more carefully.",
    "The experience showed that steady attention can make difficult work feel more manageable without sacrificing accuracy.",
    "Before packing away the materials, the group wrote down the strongest evidence and the mistake it most wanted to avoid.",
    "The result mattered, but the explanation mattered too because a useful method should be clear enough to teach someone else.",
    "A final check confirmed that the important details were present, correctly ordered, and easy to understand.",
    "The students finished knowing exactly what had worked, what had failed, and what they would change in the next attempt.",
    "The small improvement was easy to measure, which made it useful as a starting point for future practice.",
    "The notes were saved for the next session, when the same question could be tested from a different angle.",
    "What began as a simple exercise became a useful lesson in patience, precision, and careful communication.",
    "The team agreed that the best result was not the fastest one, but the one that could be explained and repeated."
  ];
  const themes=["Accuracy","Speed","Punctuation","Rhythm","Consistency","Keyboard control","Reading while typing","Editing awareness"];
  const types=["informational","narrative","procedural","reflective","school-life","science","community","history"];
  const levels=["Standard","Standard","Standard","Standard","Advanced","Advanced","Challenge","Standard"];
  const seasons=["early spring","a cool winter morning","late autumn","a warm summer afternoon","a bright September morning","a quiet Friday afternoon"];
  const names=["Mia","Noah","Aisha","Liam","Sofia","Ethan","Zoe","Arjun","Ella","Kai"];
  function rng(seed){let x=(seed>>>0)||1;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296}}
  const pick=(r,a)=>a[Math.floor(r()*a.length)];
  function make(i){
    i=Math.max(1,Math.min(TYPING_META.count,Number(i)||1));
    const r=rng(i*2654435761+1013904223);
    const setting=pick(r,settings), subject=pick(r,subjects), task=pick(r,tasks), object=pick(r,objects), observation=pick(r,observations), bridge=pick(r,bridges), ending=pick(r,endings), season=pick(r,seasons), name=pick(r,names);
    const introTemplates=[
      `During ${season}, ${subject} worked in ${setting} to ${task}.`,
      `In ${setting}, ${subject} asked ${name} to help ${task}.`,
      `At the beginning of the session, ${subject} arrived at ${setting} with a plan to ${task}.`,
      `The first task in ${setting} was simple: ${subject} needed to ${task}.`,
      `After a short briefing, ${subject} began to ${task} in ${setting}.`,
      `A new project brought ${subject} to ${setting}, where the first goal was to ${task}.`,
      `Before the lesson began, ${subject} prepared ${object} in ${setting} so the group could ${task}.`,
      `${name} noticed that ${subject} had chosen ${setting} as the best place to ${task}.`,
      `The timetable gave ${subject} enough time in ${setting} to ${task} carefully.`,
      `At ${setting}, ${subject} started with one clear instruction: ${task}.`,
      `A note on the board reminded ${subject} to ${task} before the session ended.`,
      `Near the doorway of ${setting}, ${subject} checked the plan and began to ${task}.`,
      `${name} opened the session by asking ${subject} to ${task} without rushing.`,
      `The group had one clear goal in ${setting}: ${task}.`
    ];
    const detailTemplates=[
      `They used ${object} and recorded each step as it happened.`,
      `Everyone agreed to work slowly enough to notice ${observation}.`,
      `The first check suggested that ${observation}, so the group compared its notes again.`,
      `Rather than guessing, they listed the known information before deciding what to do next.`,
      `A second person checked the notes while the first person completed the practical work.`,
      `The group kept the instructions visible and marked each completed step on a checklist.`,
      `When two answers looked possible, they returned to the evidence and tested both explanations.`,
      `The students also wrote down one mistake so the next attempt could be compared fairly.`,
      `A short pause made it easier to notice punctuation, spacing, and small changes in wording.`,
      `They discovered that a clear process was more useful than a hurried answer.`,
      `A quick comparison showed which details were useful and which could safely be ignored.`,
      `The group wrote a short heading beside each observation so the notes stayed organised.`,
      `When the first attempt looked uncertain, they checked the original instruction again.`,
      `One student read the record aloud while another checked each important detail.`,
      `They kept the final explanation short, precise, and connected to the evidence.`
    ];
    const intro=pick(r,introTemplates), detail=pick(r,detailTemplates);
    const text=[intro,detail,bridge,ending].join(" ");
    const words=text.trim().split(/\s+/);
    const difficulty=levels[(i+Math.floor(i/10))%levels.length];
    return {id:`TY-${String(i).padStart(5,"0")}`,number:i,difficulty,text,topic:themes[i%themes.length],target_wpm:25+(i%10)*5,word_count:words.length,estimated_seconds:120,passage_type:types[(i*3)%types.length],version:"v69"};
  }
  function get(n){return make(n)}
  function sample(count=16000){const out=[];for(let i=1;i<=count;i++)out.push(make(i));return out}
  window.SelectiCoreTyping={META:TYPING_META,get,make,sample};
})();
