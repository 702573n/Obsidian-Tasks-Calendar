import { App, moment } from 'obsidian';
import { getAPI } from 'obsidian-dataview';
import { hasTimeFormat, getTime } from './Tools/Utils';
import { arrowLeftIcon, arrowRightIcon, filterIcon, monthIcon, weekIcon, listIcon } from './Tools/Utils';
import { cellTemplate, taskNumberTemplate } from './Tools/Utils';
import { getFilename, getCurrent, momentToRegex, getTasks, isOverdue, isTimePassed, isDueOrScheduled, isStart, isTime, isDone, isCancelled, setTaskContentContainer } from './Tools/Utils';
import { setStatisticPopUp, setWeekViewContext, setStatisticValues, removeExistingView } from './Tools/Utils';

export default class Calendar {
    app: App;
    dv: any;
    tasks: any;
    rootNode: HTMLElement;
    current: {today: any, day: any, month: any, year: any};
    firstDayOfWeek: number;
    upcomingDays: number;
    dailyNoteFolder: string;
    taskCountOnly: boolean;
    disableRecurrence: boolean;
    constructor(app: App){
        this.app = app;
        this.dv = getAPI(app);
    }
    checkForErrors = (input: {[name: string]: string}, el: HTMLElement) => {
        let {pages, view, firstDayOfWeek, globalTaskFilter, dailyNoteFolder, dailyNoteFormat, startPosition, upcomingDays, css, options} = input;
        if (!options.includes("style")) {
            el.createSpan('> [!ERROR] Missing style parameter\n> \n> Please set a style inside options parameter like\n> \n> `options: "style1"`')
            return false;
        }
        if (!view) { 
            el.createSpan('> [!ERROR] Missing view parameter\n> \n> Please set a default view inside view parameter like\n> \n> `view: "month"`');
            return false;
        }
        if (firstDayOfWeek) { 
            if (firstDayOfWeek.match(/[|\\0123456]/g) == null) { 
                el.createSpan('> [!ERROR] Wrong value inside firstDayOfWeek parameter\n> \n> Please choose a number between 0 and 6');
                return false;
            };
        } else {
            el.createSpan('> [!ERROR] Missing firstDayOfWeek parameter\n> \n> Please set the first day of the week inside firstDayOfWeek parameter like\n> \n> `firstDayOfWeek: "1"`'); 
            return false;
        };
        if (startPosition && !startPosition.match(/\d{4}\-\d{1,2}/gm)) {
            el.createSpan('> [!ERROR] Wrong startPosition format\n> \n> Please set a startPosition with the following format\n> \n> Month: `YYYY-MM` | Week: `YYYY-ww`');
            return false;
        }
        if (dailyNoteFormat && dailyNoteFormat.match(/[|\\YMDWwd.,-: \[\]]/g) && dailyNoteFormat.match(/[|\\YMDWwd.,-: \[\]]/g)!.length != dailyNoteFormat.length) { 
            el.createSpan('> [!ERROR] The `dailyNoteFormat` contains invalid characters'); 
            return false; 
        }
        return true;
    }

    setTasks = (pages: string) => {
        if (pages == "") {
            this.tasks = this.dv.pages().file.tasks;
        } else if (typeof pages === "string" && pages.startsWith("dv.pages")) {
            const pagesContent = pages.match(/\((.*)\)/)?.[1];
            if (pagesContent) {
                this.tasks = this.dv.pages(pagesContent).file.tasks;
            } else {
                this.tasks = this.dv.pages().file.tasks;
            }
        } else {
            this.tasks = this.dv.pages(pages).file.tasks;
        }
    }
	displayCalendar = (input: {[name: string]: string}, element: HTMLElement) => {
        if(!this.checkForErrors(input, element)){
            return false;
        }
        let {pages, view, firstDayOfWeek, globalTaskFilter, dailyNoteFolder, dailyNoteFormat, startPosition, upcomingDays, 
            css, options, taskCountOnly, disableRecurrence} = input;
        this.firstDayOfWeek = firstDayOfWeek? parseInt(firstDayOfWeek) : 0;
        this.upcomingDays = upcomingDays? parseInt(upcomingDays) : 7;
        this.dailyNoteFolder = dailyNoteFolder ? dailyNoteFolder : "";
        this.taskCountOnly = taskCountOnly == "true";
        this.disableRecurrence = disableRecurrence == "true";
        this.setTasks(pages);
        // Variables
        if (!dailyNoteFormat)
            dailyNoteFormat = "YYYY-MM-DD";
        let selectedMonth = moment(startPosition || moment(), "YYYY-MM").date(1);
        let selectedList = moment(startPosition || moment(), "YYYY-MM").date(1);
        let selectedWeek = moment(startPosition || moment(), "YYYY-ww").startOf("week");
        this.current = getCurrent();
        let selectedDate;
        let tid = (new Date()).getTime();
        if (view.toLowerCase() == "month") {
            selectedDate = selectedMonth;
        } else if (view.toLowerCase() == "week") {
            selectedDate = selectedWeek;
        } else if (view.toLowerCase() == "list") {
            selectedDate = selectedList;
        }
        this.rootNode = element as HTMLElement;
        this.rootNode.classList.add("tasksCalendar");
        options.split(" ").forEach((option: string) => {
            this.rootNode.classList.add(option);
        });
        this.rootNode.setAttribute("id", "tasksCalendar"+tid);
        this.rootNode.setAttribute("view", view);
        this.rootNode.setAttribute("style", 'position:relative;-webkit-user-select:none!important');
        this.rootNode.createSpan();
        if (css) {
            let style = document.createElement("style");
            style.innerHTML = css;
            this.rootNode.append(style)
        };
        // Initialze
        this.getMeta(dailyNoteFormat, globalTaskFilter);
        this.setButtons(selectedDate);
        setStatisticPopUp(this.rootNode, this.dv);
        setWeekViewContext(this.rootNode, this.dv);
        if(view.toLowerCase() == "month") {
            this.getMonth(selectedDate);
        } else if(view.toLowerCase() == "week") {
            this.getWeek(selectedDate);
        } else if(view.toLowerCase() == "list") {
            this.getList(selectedDate);
        }
    }

    getMeta = (dailyNoteFormat : string, globalTaskFilter: string)  =>{
        let dailyNoteRegEx = momentToRegex(dailyNoteFormat);
        if(!globalTaskFilter) globalTaskFilter = "#task";
        for (let task of this.tasks) {
            let taskText = task.text;
            let taskFile = getFilename(task.path);
            let dueMatch = taskText.match(/\📅\W(\d{4}\-\d{2}\-\d{2})/);
            let scheduledMatch = taskText.match(/\⏳\W(\d{4}\-\d{2}\-\d{2})/);
            let startMatch = taskText.match(/\🛫\W(\d{4}\-\d{2}\-\d{2})/);
            let completionMatch = taskText.match(/\✅\W(\d{4}\-\d{2}\-\d{2})/);
            let dailyNoteMatch = taskFile?.match(dailyNoteRegEx);
            let dailyTaskMatch = taskText.match(/(\d{4}\-\d{2}\-\d{2})/);
            let repeatMatch = taskText.includes("🔁");
            let matchResult = taskText.match(/🔁\s*(.*?)\s*[🛫⏳📅⌚]/);
            if (dueMatch) {
                task.due = dueMatch[1];
                task.text = task.text.replace(dueMatch[0], "");
            };
            if (scheduledMatch) {
                task.scheduled = scheduledMatch[1];
                task.text = task.text.replace(scheduledMatch[0], "");
            };
            if (startMatch) {
                task.start = startMatch[1];
                task.text = task.text.replace(startMatch[0], "");
            };
            if (completionMatch) {
                task.completion = completionMatch[1];
                task.text = task.text.replace(completionMatch[0], "");
            };
            if(isOverdue(task)){
                task.type = "overdue";
                task.typePriority = 1;
                task.moment = task.due ? moment(task.due) : moment(task.scheduled);
            }else if(isTimePassed(task)){
                task.type = "timePassed";
                task.typePriority = 2;
                let time = getTime(taskText).split(":");
                let day = task.due ? moment(task.due) : moment(task.scheduled);
                task.moment = day.add(parseInt(time[0]), "hours").add(parseInt(time[1]), "minutes");
            }else if(isDueOrScheduled(task) && !hasTimeFormat(task)){
                if(moment(task.due).isSameOrBefore(task.scheduled)){
                    task.type = "due";
                    task.typePriority = 3;
                    task.moment = moment(task.due);
                }else{
                    task.type = "scheduled";
                    task.typePriority = 3;
                    task.moment = moment(task.scheduled);
                }
            }else if(isStart(task)){
                task.type = "start";
                task.typePriority = 4;
                task.moment = moment(task.start);
            }else if(isTime(task)){
                task.type = "time";
                task.typePriority = 5;
                let time = getTime(taskText).split(":");
                let day = task.due ? moment(task.due) : moment(task.scheduled);
                task.moment = day.add(parseInt(time[0]), "hours").add(parseInt(time[1]), "minutes");
            }else if(isDone(task)){
                task.type = "done";
                task.typePriority = 6;
                task.moment = moment(task.completion);
            }else if(isCancelled(task)){
                task.type = "cancelled";
                task.typePriority = 7;
                task.moment = moment(task.due);
            }
            if (dailyNoteMatch && !dailyTaskMatch) {
                task.dailyNote = moment(dailyNoteMatch[1], dailyNoteFormat).format("YYYY-MM-DD");
            }
            if (task.type != "done" && task.type != "cancelled" && repeatMatch) {
                task.recurrence = true;
                if(!this.disableRecurrence){
                    task.recurringValue = matchResult ? matchResult[1] : "";
                }
                task.text = task.text.substring(0, taskText.indexOf("🔁"))
            };
            let lowMatch = taskText.includes("🔽");
            if (lowMatch) {
                task.priority = "D";
            };
            let mediumMatch = taskText.includes("🔼");
            if (mediumMatch) {
                task.priority = "B";
            };
            let highMatch = taskText.includes("⏫");
            if (highMatch) {
                task.priority = "A";
            };
            if (!lowMatch && !mediumMatch && !highMatch) {
                task.priority = "C";
            }
            task.text = task.text.replaceAll(globalTaskFilter,"");
            task.text = task.text.replaceAll("[[","");
            task.text = task.text.replaceAll("]]","");
            task.text = task.text.replace(/\[.*?\]/gm,"");
        }
    }
    setButtons = (selectedDate: any) => {
        let buttons = `
            <button class='filter'>
				${filterIcon}
            </button>
            <button class='listView' title='List'>
                ${listIcon}
            </button>
            <button class='monthView' title='Month'>
                ${monthIcon}
            </button>
            <button class='weekView' title='Week'>
                ${weekIcon}
            </button>
            <button class='current'>
            </button>
            <button class='previous'>
                ${arrowLeftIcon}
            </button>
            <button class='next'>
                ${arrowRightIcon}
            </button>
            <button class='statistic' percentage=''>
            </button>`;
        let buttonsEl = this.rootNode.createEl("div", {cls: "buttons"});
        buttonsEl.innerHTML = buttons;
        this.rootNode.querySelector("span")!.appendChild(buttonsEl);
        this.setButtonEvents(selectedDate);
    };
    
    setButtonEvents = (selectedDate: any) => {
        this.rootNode.querySelectorAll('button').forEach(btn => btn.addEventListener('click', (() => {
            let activeView = this.rootNode.getAttribute("view");
            if ( btn.className == "previous" ) {
                if (activeView == "month") {
                    selectedDate = moment(selectedDate).subtract(1, "months");
                    this.getMonth(selectedDate);
                } else if (activeView == "week") {
                    selectedDate = moment(selectedDate).subtract(7, "days").startOf("week");
                    this.getWeek(selectedDate);
                } else if (activeView == "list") {
                    selectedDate = moment(selectedDate).subtract(1, "months");
                    this.getList(selectedDate);
                }
            } else if ( btn.className == "current") {
                if (activeView == "month") {
                    selectedDate = moment().date(1);
                    this.getMonth(selectedDate);
                } else if (activeView == "week") {
                    selectedDate = moment().startOf("week");
                    this.getWeek(selectedDate);
                } else if (activeView == "list") {
                    selectedDate = moment().date(1);
                    this.getList(selectedDate);
                };
            } else if ( btn.className == "next" ) {
                if (activeView == "month") {
                    selectedDate = moment(selectedDate).add(1, "months");
                    this.getMonth(selectedDate);
                } else if (activeView == "week") {
                    selectedDate = moment(selectedDate).add(7, "days").startOf("week");
                    this.getWeek(selectedDate);
                } else if (activeView == "list") {
                    selectedDate = moment(selectedDate).add(1, "months");
                    this.getList(selectedDate);
                };
            } else if ( btn.className == "filter" ) {
                this.rootNode.classList.toggle("filter");
                this.rootNode.querySelector('#statisticDone')!.classList.remove("active");
                this.rootNode.classList.remove("focusDone");
            } else if ( btn.className == "monthView" ) {
                if ( moment().format("ww-YYYY") == moment(selectedDate).format("ww-YYYY") ) {
                    selectedDate = moment().date(1);
                } else {
                    selectedDate = moment(selectedDate).date(1);
                };
                this.getMonth(selectedDate);
            } else if ( btn.className == "listView" ) {
                if ( moment().format("ww-YYYY") == moment(selectedDate).format("ww-YYYY") ) {
                    selectedDate = moment().date(1);
                } else {
                    selectedDate = moment(selectedDate).date(1);
                };
                this.getList(selectedDate);
            } else if ( btn.className == "weekView" ) {
                if (this.rootNode.getAttribute("view") == "week") {
					let leftPos = (this.rootNode.querySelector("button.weekView") as HTMLElement).offsetLeft;
					(this.rootNode.querySelector(".weekViewContext") as HTMLElement).style.left = leftPos+"px";
                    this.rootNode.querySelector(".weekViewContext")!.classList.toggle("active");
                    if (this.rootNode.querySelector(".weekViewContext")!.classList.contains("active")) {
                        let closeContextListener = function() {
                            this.rootNode.querySelector(".weekViewContext").classList.remove("active");
                            this.rootNode.removeEventListener("click", closeContextListener, false);
                        };
                        setTimeout(function() {
                            this.rootNode.addEventListener("click", closeContextListener, false);
                        }, 100);
                    };
                } else {
                    if (moment().format("MM-YYYY") != moment(selectedDate).format("MM-YYYY")) {
                        selectedDate = moment(selectedDate).startOf("month").startOf("week");
                    } else {
                        selectedDate = moment().startOf("week");
                    };
                    this.getWeek(selectedDate);
                };
            } else if ( btn.className == "statistic" ) {
                this.rootNode.querySelector(".statisticPopup")!.classList.toggle("active");
            };
            btn.blur();
        })));
        this.rootNode.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });
    }
    getMonth = (month: any) => {
        removeExistingView(this.rootNode);
        this.rootNode.querySelector('button.current')!.innerHTML = `<span>${moment(month).format("MMMM")}</span><span>${moment(month).format("YYYY")}</span>`;
        let firstDayOfMonth = parseInt(moment(month).format("d"));
        let lastDateOfMonth = parseInt(moment(month).endOf("month").format("D"));
        let dueCounter = 0;
        let doneCounter = 0;
        let overdueCounter = 0;
        let startCounter = 0;
        let scheduledCounter = 0;
        let recurrenceCounter = 0;
        let dailyNoteCounter = 0;
        let monthName = moment(month).format("MMM").replace(".","").substring(0,3);
        
        // Move First Week Of Month To Second Week In Month View
        if (firstDayOfMonth == 0)
            firstDayOfMonth = 7;
        
        // Set Grid Heads
        let gridHeads = "";
        for (let h=0-firstDayOfMonth+this.firstDayOfWeek;h<7-firstDayOfMonth+this.firstDayOfWeek;h++) {
            let weekDayNr = moment(month).add(h, "days").format("d");
            let weekDayName = moment(month).add(h, "days").format("ddd");
            if ( this.current.day == weekDayNr && this.current.month == moment(month).format("M") && this.current.year == moment(month).format("YYYY") ) {
                gridHeads += `<div class='gridHead today' data-weekday='${weekDayNr}'>${weekDayName}</div>`;
            } else {
                gridHeads += `<div class='gridHead' data-weekday='${weekDayNr}'>${weekDayName}</div>`;
            };
        };
        
        // Set Wrappers
        let wrappers = "";
        let starts = 0-firstDayOfMonth+this.firstDayOfWeek;
        for (let w=1; w<7; w++) {
            let wrapper = "";
            let weekNr = "";
            let yearNr = "";
            for (let i=starts;i<starts+7;i++) {
                if (i==starts) {
                    weekNr = moment(month).add(i, "days").format("w");
                    yearNr = moment(month).add(i, "days").format("YYYY");
                };
                let currentDate = moment(month).add(i, "days").format("YYYY-MM-DD");
                let dailyNotePath = this.dailyNoteFolder+"/"+currentDate
                let weekDay = moment(month).add(i, "days").format("d");
                let shortDayName = moment(month).add(i, "days").format("D");
                let longDayName = moment(month).add(i, "days").format("D. MMM");
    
                // Filter Tasks
                let status = getTasks(this.tasks, currentDate);
                // Count Events Only From Selected Month
                if (moment(month).format("MM") == moment(month).add(i, "days").format("MM")) {
                    dueCounter += status.filter((t:any)=>t.type == "due").length;
                    dueCounter += status.filter((t:any)=>t.type == "scheduled").length;
                    dueCounter += status.filter((t:any)=>t.type == "dailyNote").length;
                    doneCounter += status.filter((t:any)=>t.type == "done").length;
                    startCounter += status.filter((t:any)=>t.type == "start").length;
                    scheduledCounter += status.filter((t:any)=>t.type == "scheduled").length;
                    recurrenceCounter += status.filter((t:any)=>t.recurence).length;
                    dailyNoteCounter += status.filter((t:any)=>t.type == "dailyNote").length;
                    overdueCounter = status.filter((t:any)=>t.type == "overdue").length;
                };
                
                // Set New Content Container
                
                let cellContent = setTaskContentContainer(status, this.dv, currentDate);
                let cls = "";
                // Set prevMonth, currentMonth, nextMonth
                if (i < 0) {
                    cls = "prevMonth";
                } else if (i >= 0 && i < lastDateOfMonth && this.current.today !== currentDate) {
                    cls = "currentMonth";
                } else if ( i >= 0 && i< lastDateOfMonth && this.current.today == currentDate) {
                    cls = "currentMonth today";
                } else if (i >= lastDateOfMonth) {
                    cls = "nextMonth";
                };
                // Set Cell Name And Weekday
                if(this.taskCountOnly){
                    let taskCount = status.length;
                    cellContent = taskNumberTemplate(taskCount, cls);
                }
                if ( parseInt(moment(month).add(i, "days").format("D")) == 1 ) {
                    wrapper += cellTemplate(`${cls} newMonth`, weekDay, dailyNotePath, longDayName, cellContent);
                } else {
                    wrapper += cellTemplate(cls, weekDay, dailyNotePath, shortDayName, cellContent);
                };
                
            };
            wrappers += `<div class='wrapper'><div class='wrapperButton' data-week='${weekNr}' data-year='${yearNr}'>W${weekNr}</div>${wrapper}</div>`;
            starts += 7;
        };
        let gridEl = this.rootNode.createEl("div");
        gridEl.innerHTML = `<div class='gridHeads'><div class='gridHead'></div>${gridHeads}</div>
            <div class='wrappers' data-month='${monthName}'>${wrappers}</div>`;;
        gridEl.classList.add("grid");
        this.rootNode.querySelector("span")!.appendChild(gridEl);
        this.setWrapperEvents(month);
        setStatisticValues(this.rootNode, dueCounter, doneCounter, overdueCounter, startCounter, scheduledCounter, recurrenceCounter, dailyNoteCounter);
        this.rootNode.setAttribute("view", "month");
    }
    getWeek = (week: any) =>{
        removeExistingView(this.rootNode);
        if(this.rootNode.querySelector('button.current')) 
            this.rootNode.querySelector('button.current')!.innerHTML = `<span>${moment(week).format("YYYY")}</span><span>${moment(week).format("[W]w")}</span>`;
        let gridContent = "";
        let currentWeekday = parseInt(moment(week).format("d"));
        let weekNr = moment(week).format("[W]w");
        let dueCounter = 0;
        let doneCounter = 0;
        let overdueCounter = 0;
        let startCounter = 0;
        let scheduledCounter = 0;
        let recurrenceCounter = 0;
        let dailyNoteCounter = 0;
        
        for (let i=0-currentWeekday+this.firstDayOfWeek;i<7-currentWeekday+this.firstDayOfWeek;i++) {
            let currentDate = moment(week).add(i, "days").format("YYYY-MM-DD");
            let dailyNotePath = this.dailyNoteFolder+"/"+currentDate;
            let weekDay = moment(week).add(i, "days").format("d");
            let dayName = moment(currentDate).format("ddd D.");
            let longDayName = moment(currentDate).format("ddd, D. MMM");
            
            // Filter Tasks
            let status = getTasks(this.tasks, currentDate);
            
            // Count Events From Selected Week
            dueCounter += status.filter((t:any)=>t.type == "due").length;
            dueCounter += status.filter((t:any)=>t.type == "scheduled").length;
            dueCounter += status.filter((t:any)=>t.type == "dailyNote").length;
            doneCounter += status.filter((t:any)=>t.type == "done").length;
            startCounter += status.filter((t:any)=>t.type == "start").length;
            scheduledCounter += status.filter((t:any)=>t.type == "scheduled").length;
            recurrenceCounter += status.filter((t:any)=>t.recurence).length;
            dailyNoteCounter += status.filter((t:any)=>t.type == "dailyNote").length;
            overdueCounter = status.filter((t:any)=>t.type == "overdue").length;
        
            // Set New Content Container
            let cellContent = setTaskContentContainer(status, this.dv, currentDate);
            
            // Set Cell Name And Weekday
            let cell;
            let cls = "";
            // Set Today, Before Today, After Today
            if (currentDate < this.current.today) {
                cls = "beforeToday";
            } else if (currentDate == this.current.today) {
                cls = "today";
            } else if (currentDate > this.current.today) {
                cls = "afterToday";
            };
            // Set Cell Name And Weekday
            if(this.taskCountOnly){
                let taskCount = 0;
                for(let type in status) taskCount += type == "overdue" ? overdueCounter : (status as {[key: string]: any})[type].length;
                cellContent = taskNumberTemplate(taskCount, cls);
            }
            if ( parseInt(moment(week).add(i, "days").format("D")) == 1 ) {
                cell = cellTemplate(cls, weekDay, dailyNotePath, longDayName, cellContent);
            } else {
                cell = cellTemplate(cls, weekDay, dailyNotePath, dayName, cellContent);
            };
                
            gridContent += cell;
        };
        let gridEl = this.rootNode.createEl("div", {cls: "grid", attr: {"data-week": weekNr}});
        gridEl.innerHTML = gridContent;
        this.rootNode.querySelector("span")!.appendChild(gridEl);
        setStatisticValues(this.rootNode, dueCounter, doneCounter, overdueCounter, startCounter, scheduledCounter, recurrenceCounter, dailyNoteCounter);
        this.rootNode.setAttribute("view", "week");
    };
    
    getList = (month: any) => {
        removeExistingView(this.rootNode);
        this.rootNode.querySelector('button.current')!.innerHTML = `<span>${moment(month).format("MMMM")}</span><span>${moment(month).format("YYYY")}</span>`;
        let listContent = "";
        let dueCounter = 0;
        let doneCounter = 0;
        let overdueCounter = 0;
        let startCounter = 0;
        let scheduledCounter = 0;
        let recurrenceCounter = 0;
        let dailyNoteCounter = 0;
        let monthName = moment(month).format("MMM").replace(".","").substring(0,3);
        
        // Loop Days From Current Month
        for (let i=0;i<parseInt(moment(month).endOf('month').format("D"));i++) {
            let currentDate = moment(month).startOf('month').add(i, "days").format("YYYY-MM-DD");
    
            // Filter Tasks
            let status = getTasks(this.tasks, currentDate);
            
            // Count Events
            dueCounter += status.filter((t:any)=>t.type == "due").length;
            dueCounter += status.filter((t:any)=>t.type == "scheduled").length;
            dueCounter += status.filter((t:any)=>t.type == "dailyNote").length;
            doneCounter += status.filter((t:any)=>t.type == "done").length;
            startCounter += status.filter((t:any)=>t.type == "start").length;
            scheduledCounter += status.filter((t:any)=>t.type == "scheduled").length;
            recurrenceCounter += status.filter((t:any)=>t.recurence).length;
            dailyNoteCounter += status.filter((t:any)=>t.type == "dailyNote").length;
            overdueCounter = status.filter((t:any)=>t.type == "overdue").length;
            if (moment().format("YYYY-MM-DD") == currentDate) {
                let overdueDetails = `<details open class='overdue'><summary>Overdue</summary>${setTaskContentContainer(status, this.dv, currentDate)}</details>`;
                let todayDetails = `<details open class='today'><summary>Today</summary>${setTaskContentContainer(status, this.dv, currentDate)}</details>`;
                
                // Upcoming
                let upcomingContent = "";
                for (let t=1;t<this.upcomingDays+1;t++) {
                    let next = moment(currentDate).add(t, "days").format("YYYY-MM-DD");
                    upcomingContent += setTaskContentContainer(getTasks(this.tasks,next), this.dv, next);
                };
                let upcomingDetails = `<details open class='upcoming'><summary>Upcoming</summary>${upcomingContent}</details>`;
                
                listContent += `<details open class='today'><summary><span>${moment(currentDate).format("dddd, D")}</span><span class='weekNr'>${moment(currentDate).format("[W]w")}</span></summary><div class='content'>${overdueDetails}${todayDetails}${upcomingDetails}</div></details>`
                
            } else {
                listContent += `<details open><summary><span>${moment(currentDate).format("dddd, D")}</span><span class='weekNr'>${moment(currentDate).format("[W]w")}</span></summary><div class='content'>${setTaskContentContainer(status, this.dv, currentDate)}</div></details>`
            };
        };
        let listContentEl = this.rootNode.createEl("div", {cls: "grid", });
        listContentEl.innerHTML = listContent;
        listContentEl.classList.add("list");
        listContentEl.setAttribute("data-month", monthName);
        this.rootNode.querySelector("span")!.appendChild(listContentEl);
        setStatisticValues(this.rootNode, dueCounter, doneCounter, overdueCounter, startCounter, scheduledCounter, recurrenceCounter, dailyNoteCounter);
        this.rootNode.setAttribute("view", "list");
        
        // Scroll To Today If Selected Month Is Current Month
        if ( moment().format("YYYY-MM") == moment(month).format("YYYY-MM") ) {
            let listElement = this.rootNode.querySelector(".list")!;
            let todayElement = this.rootNode.querySelector(".today")! as HTMLElement;
            let scrollPos = todayElement.offsetTop - todayElement.offsetHeight + 85;
            listElement.scrollTo(0, scrollPos);
        }
    }
    setWrapperEvents(selectedDate: any) {
        this.rootNode.querySelectorAll('.wrapperButton').forEach(wBtn => wBtn.addEventListener('click', (() => {
            let week = wBtn.getAttribute("data-week");
            let year = wBtn.getAttribute("data-year");
            selectedDate = moment(moment(year).add(week, "weeks")).startOf("week");
            this.rootNode.querySelector(`.grid`)!.remove();
            this.getWeek(selectedDate);
        })));
    };
}