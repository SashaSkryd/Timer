import React from "react";
import { useState, useEffect, useRef } from "react";
import { interval, Subject, fromEvent } from "rxjs";
import { takeUntil, buffer, debounceTime, map, filter } from "rxjs/operators";
import './App.scss';


export default function App() {

  const [time, setTime] = useState(0);
  const [start, setStart] = useState("stopTimer");
  
  useEffect(()=>{

    const unsubscribes = new Subject();
    
    // const timer = new Observable(observer => {
    //   let counter = 0;
    //   const intervalId = setInterval(() => {
    //     observer.next(counter++);
    //   }, 1000);
    //   return () => {
    //    clearInterval(intervalId);
    //   }
    // });

    const timer = interval(1000);

    timer.pipe(takeUntil(unsubscribes))
    .subscribe(()=>{
      if(start === "startTimer"){
        setTime((prevState)=>prevState + 1000);
      };
    });
    return ()=>{
      unsubscribes.next();
      unsubscribes.complete();
    }
    
  },[start]);

  const stopTimer = () => {
    setStart("stopTimer");
    setTime(0);
  }

  const wait = useRef(null);

  useEffect(()=>{
   
    const waitObservers = fromEvent(wait.current, 'click');
    const bufferTimes = waitObservers.pipe(debounceTime(300));
    const clicks = waitObservers.pipe(
      buffer(bufferTimes),
      map((clicks)=>{
        return clicks.length;
      }),
      filter((clickFinish)=>clickFinish === 2)
    );

    const clickSubscribes = clicks.subscribe(()=>{
      setStart('waitTimer');
    });

    return ()=>clickSubscribes.unsubscribe();

  },[]);

  return (
    <div className="App">
      <span>Time "{new Date(time).toISOString().slice(11,19)}"</span>
      <div className="button-wrapper">
      <button onClick={()=>setStart("startTimer")}>Start</button>
      <button onClick={()=>stopTimer()}>Stop</button>
      <button ref={wait}>Wait</button>
      <button onClick={()=>setTime(0)}>Reset</button>
      </div>
    </div>
  );
}

