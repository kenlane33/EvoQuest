import React,{useState,useEffect} from 'react';
import {ArrowUp,ArrowDown,ArrowLeft,ArrowRight,Heart,Check,X} from 'lucide-react';

const historyQuestions=[
  {q:"Which empire was founded by Cyrus the Great?",options:["Persian Empire","Roman Empire","Mongol Empire","Byzantine Empire"],c:0},
  {q:"Who built the Pyramids?",options:["Egyptians","Mayans","Romans","Greeks"],c:0},
  {q:"First Emperor of China?",options:["Qin Shi Huang","Sun Yat-sen","Kublai Khan","Wu Zetian"],c:0},
  {q:"Capital of Byzantine Empire?",options:["Constantinople","Rome","Athens","Alexandria"],c:0},
  {q:"First writing system?",options:["Sumerians","Egyptians","Chinese","Indians"],c:0},
  {q:"Who built Hanging Gardens?",options:["Nebuchadnezzar II","Hammurabi","Sargon","Gilgamesh"],c:0},
  {q:"Main Roman language?",options:["Latin","Greek","Hebrew","Aramaic"],c:0},
  {q:"Who wrote The Republic?",options:["Plato","Aristotle","Socrates","Herodotus"],c:0},
  {q:"Which battle ended Persian invasion?",options:["Plataea","Marathon","Thermopylae","Salamis"],c:0},
  {q:"Alexander's teacher?",options:["Aristotle","Plato","Socrates","Pythagoras"],c:0},
  {q:"First Holy Roman Emperor?",options:["Charlemagne","Otto I","Frederick I","Henry IV"],c:0},
  {q:"Who built Taj Mahal?",options:["Shah Jahan","Akbar","Aurangzeb","Babur"],c:0},
  {q:"Founded Mongol Empire?",options:["Genghis Khan","Kublai Khan","Attila","Tamerlane"],c:0},
  {q:"14th century Europe plague?",options:["Black Death","Spanish Flu","Great Plague","Yellow Fever"],c:0},
  {q:"Painted Mona Lisa?",options:["da Vinci","Michelangelo","Raphael","Donatello"],c:0},
  {q:"First global circumnavigation?",options:["Magellan","Columbus","Drake","da Gama"],c:0},
  {q:"Invented printing press?",options:["Gutenberg","Caxton","Luther","Erasmus"],c:0},
  {q:"Sun King of France?",options:["Louis XIV","Louis XVI","Louis XV","Louis XIII"],c:0},
  {q:"Virgin Queen?",options:["Elizabeth I","Mary I","Victoria","Anne"],c:0},
  {q:"Led Protestant Reformation?",options:["Luther","Calvin","Henry VIII","Knox"],c:0},
  {q:"Wrote Declaration of Independence?",options:["Jefferson","Franklin","Adams","Washington"],c:0},
  {q:"First English settlement in America?",options:["Jamestown","Plymouth","Roanoke","Boston"],c:0},
  {q:"Issued Emancipation Proclamation?",options:["Lincoln","Washington","Jefferson","Jackson"],c:0},
  {q:"First female Nobel winner?",options:["Curie","Mother Teresa","Buck","Addams"],c:0},
  {q:"First to South Pole?",options:["Norway","Britain","USA","Russia"],c:0},
  {q:"First moonwalk?",options:["Armstrong","Aldrin","Gagarin","Glenn"],c:0},
  {q:"United Japan?",options:["Tokugawa","Nobunaga","Hideyoshi","Meiji"],c:0},
  {q:"Longest Chinese dynasty?",options:["Zhou","Han","Ming","Qing"],c:0},
  {q:"Built Great Zimbabwe?",options:["Shona","Zulu","Mali","Swahili"],c:0},
  {q:"Famous Egyptian beauty queen?",options:["Cleopatra","Nefertiti","Hatshepsut","Tiye"],c:0}
];

export default function Game(){
  const [p,setP]=useState({x:2,y:2});
  const [m,setM]=useState([]);
  const [q,setQ]=useState(null);
  const [s,setS]=useState(0);
  const [h,setH]=useState(3);
  const [go,setGo]=useState(false);
  const [map,setMap]=useState(Array(15).fill().map(()=>Array(15).fill(1)));
  const [l,setL]=useState(1);
  const [i,setI]=useState([]);
  const [fb,setFb]=useState(null);

  const gen=()=>{
    const n=Array(15).fill().map(()=>Array(15).fill(1));
    const r=[{x:2,y:2,w:3,h:3},{x:9,y:2,w:4,h:3},{x:2,y:9,w:3,h:4},{x:9,y:9,w:4,h:4}];
    r.forEach(({x,y,w,h})=>{
      for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++)n[y+dy][x+dx]=0;
    });
    r.forEach(({x,y,w},j)=>{
      if(j%2===0)for(let dx=x+w;dx<x+7;dx++)n[y+1][dx]=0;
      if(j<2)for(let dy=y+w;dy<y+7;dy++)n[dy][x+1]=0;
    });
    setMap(n);
    const nm=[],ni=[];
    for(let j=0;j<8;j++){
      let x,y;
      do{x=Math.floor(Math.random()*15);y=Math.floor(Math.random()*15);
      }while(n[y][x]===1||x===p.x&&y===p.y||nm.some(m=>m.x===x&&m.y===y));
      nm.push({x,y,t:Math.random()<.3?'b':'n'});
    }
    for(let j=0;j<3;j++){
      let x,y;
      do{x=Math.floor(Math.random()*15);y=Math.floor(Math.random()*15);
      }while(n[y][x]===1||x===p.x&&y===p.y||nm.some(m=>m.x===x&&m.y===y)||ni.some(t=>t.x===x&&t.y===y));
      ni.push({x,y,t:Math.random()<.5?'h':'c'});
    }
    setM(nm);
    setI(ni);
  };

  useEffect(()=>{gen()},[l]);

  useEffect(()=>{
    if(fb){
      const timer=setTimeout(()=>setFb(null),2000);
      return()=>clearTimeout(timer);
    }
  },[fb]);

  useEffect(()=>{
    const handleKey=e=>{
      if(q||go)return;
      switch(e.key.toLowerCase()){
        case 'arrowup':case'w':move(0,-1);break;
        case 'arrowdown':case's':move(0,1);break;
        case 'arrowleft':case'a':move(-1,0);break;
        case 'arrowright':case'd':move(1,0);break;
      }
    };
    window.addEventListener('keydown',handleKey);
    return()=>window.removeEventListener('keydown',handleKey);
  },[q,go,p,map,m,i]);

  const move=(dx,dy)=>{
    if(go||q)return;
    const nx=p.x+dx,ny=p.y+dy;
    if(nx>=0&&nx<15&&ny>=0&&ny<15&&map[ny][nx]===0){
      setP({x:nx,y:ny});
      const mc=m.findIndex(e=>e.x===nx&&e.y===ny);
      if(mc!==-1){
        const mon=m[mc];
        setQ({...historyQuestions[Math.floor(Math.random()*historyQuestions.length)],mid:mc,p:mon.t==='b'?2:1});
      }
      const ic=i.findIndex(e=>e.x===nx&&e.y===ny);
      if(ic!==-1){
        const item=i[ic];
        if(item.t==='h')setH(h=>Math.min(h+1,5));
        else setS(s=>s+1);
        setI(i.filter((_,j)=>j!==ic));
      }
    }
  };

  const answer=(o)=>{
    const correct=o===q.c;
    setFb({q:q.q,correct,answer:q.options[q.c],given:q.options[o]});
    if(correct){
      setS(s+q.p);
      setM(m.filter((_,j)=>j!==q.mid));
      if(m.length<=1){setL(l=>l+1);setP({x:2,y:2});}
    }else{
      setH(h-1);
      if(h<=1)setGo(true);
    }
    setQ(null);
  };

  return(
    <div className="flex flex-col items-center relative">
      <div className="text-sm flex gap-4 mb-1">
        <div>Level: {l}</div>
        <div>Score: {s}</div>
        <div className="flex items-center gap-1"><Heart size={12} className="text-red-500"/>{h}</div>
      </div>
      {fb&&(
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/90 p-4 rounded shadow-lg text-center max-w-sm transition-opacity duration-500">
            <div className="text-lg mb-2">{fb.q}</div>
            <div className="flex items-center justify-center gap-2 text-lg">
              {fb.correct?(
                <div className="flex items-center text-green-600">
                  <Check className="mr-2"/>
                  {fb.answer}
                </div>
              ):(
                <div className="flex flex-col items-center">
                  <div className="flex items-center text-red-600 mb-2">
                    <X className="mr-2"/>
                    {fb.given}
                  </div>
                  <div className="flex items-center text-green-600">
                    <Check className="mr-2"/>
                    {fb.answer}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {go?<div className="text-sm font-bold text-red-600">Game Over! Score: {s}</div>:
      q?<div className="w-full bg-gray-100 p-2 rounded">
        <div className="text-xs mb-2 font-bold">{q.q}</div>
        <div className="flex flex-col gap-1">
          {q.options.map((o,j)=>(
            <button key={j} onClick={()=>answer(j)} className="text-xs p-2 bg-blue-500 text-white hover:bg-blue-600 rounded">{o}</button>
          ))}
        </div>
      </div>:
      <>
        <div className="inline-grid" style={{gridTemplateColumns:'repeat(15,1.5rem)'}}>
          {map.map((r,y)=>r.map((c,x)=>(
            <div key={`${x}-${y}`} className={`w-6 h-6 flex items-center justify-center text-xs ${c===1?'bg-gray-800':'bg-gray-100'} border border-gray-700`}>
              {p.x===x&&p.y===y&&'🧙'}
              {m.some(e=>e.x===x&&e.y===y)&&(m.find(e=>e.x===x&&e.y===y).t==='b'?'👾':'😈')}
              {i.some(e=>e.x===x&&e.y===y)&&(i.find(e=>e.x===x&&e.y===y).t==='h'?'❤️':'👑')}
            </div>
          )))}
        </div>
        <div className="mt-2">
          <div className="flex justify-center">
            <button className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300" onClick={()=>move(0,-1)}><ArrowUp size={16}/></button>
          </div>
          <div className="flex justify-center gap-2">
            <button className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300" onClick={()=>move(-1,0)}><ArrowLeft size={16}/></button>
            <button className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300" onClick={()=>move(1,0)}><ArrowRight size={16}/></button>
          </div>
          <div className="flex justify-center">
            <button className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300" onClick={()=>move(0,1)}><ArrowDown size={16}/></button>
          </div>
        </div>
      </>}
      <div className="text-xs mt-2 text-gray-500">Use Arrow keys or WASD to move</div>
    </div>
  );
}