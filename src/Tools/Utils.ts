import { moment } from "obsidian";
import { RRule } from "rrule";

/**
 * Functions to filter tasks 
 */
const taskNotCompleted = (t:any) => !t.completed && !t.fullyCompleted;
const taskNotCancelled = (t:any) => t.status != "-";
const isNotCompletedOrCancelled = (t: any) => taskNotCancelled(t) && taskNotCompleted(t);
const isTodayTask = (t: any) => (t.due && moment(t.due.ts).isSame(moment(), 'day') || (t.scheduled && moment(t.scheduled.ts).isSame(moment(), 'day')));
const hasTimeFormat = (t: any) => /⌚(\d{2}:\d{2})/.test(t.text);

const getTime = (timeString : string) =>{
    const time = timeString.match(/⌚(\d{2}:\d{2})/);
    if(time && time[1])
        return time![1];
    else return "";
}

export { hasTimeFormat, getTime, isNotCompletedOrCancelled };

const isTimeBeforeCurrentTime = (t: any) => {
    const timeSubstring = getTime(t.text);
    if (timeSubstring) {
        return moment(timeSubstring, 'HH:mm').isBefore(moment());
    }
    // If any condition fails, return false
    return false;
}

const getFilename = (path: string): string | undefined  => 
    (path.match(/^(?:.*\/)?([^\/]+?|)(?=(?:\.[^\/.]*)?$)/)||[])[1];
const momentToRegex = (momentFormat: string) : string => {
	momentFormat = momentFormat.replaceAll(".", "\\.");
	momentFormat = momentFormat.replaceAll(",", "\\,");
	momentFormat = momentFormat.replaceAll("-", "\\-");
	momentFormat = momentFormat.replaceAll(":", "\\:");
	momentFormat = momentFormat.replaceAll(" ", "\\s");
	
	momentFormat = momentFormat.replace("dddd", "\\w{1,}");
	momentFormat = momentFormat.replace("ddd", "\\w{1,3}");
	momentFormat = momentFormat.replace("dd", "\\w{2}");
	momentFormat = momentFormat.replace("d", "\\d{1}");
	
	momentFormat = momentFormat.replace("YYYY", "\\d{4}");
	momentFormat = momentFormat.replace("YY", "\\d{2}");
	
	momentFormat = momentFormat.replace("MMMM", "\\w{1,}");
	momentFormat = momentFormat.replace("MMM", "\\w{3}");
	momentFormat = momentFormat.replace("MM", "\\d{2}");
	
	momentFormat = momentFormat.replace("DDDD", "\\d{3}");
	momentFormat = momentFormat.replace("DDD", "\\d{1,3}");
	momentFormat = momentFormat.replace("DD", "\\d{2}");
	momentFormat = momentFormat.replace("D", "\\d{1,2}");
	
	momentFormat = momentFormat.replace("ww", "\\d{1,2}");

	return `/^(${momentFormat})$/`;
}

const getMetaFromNote = (task: any, metaName: string, dv: any) => 
    dv.pages(`"${task.link.path}"`)[metaName][0] || "";

const IsRecurringThisDay = (task: any, date: any)=>{
    if(!task.recurringValue)
        return false;
    if(moment(date).isBefore(task.moment, 'day'))
        return false;
    try{
        let rule = new RRule({
            ...RRule.fromText(task.recurringValue).origOptions,
            dtstart: task.moment.set("hour",12).toDate()
        });
        let startOfDay = moment(date).startOf("day").toDate();
        let endOfDay = moment(date).endOf("day").toDate();
        let occurrences = rule.between(startOfDay, endOfDay);
        return occurrences.length > 0;
    }catch(e){
        return false;
    }
    
}


const isDueOrScheduled = (task: any) =>
    isNotCompletedOrCancelled(task) && (task.due || task.scheduled);
const isTime = (task: any) =>
    isNotCompletedOrCancelled(task) && hasTimeFormat(task) && isDueOrScheduled(task);

const isTimePassed = (task: any) =>
    isNotCompletedOrCancelled(task) && isTodayTask(task) && isTimeBeforeCurrentTime(task);

const sortTasks = (a: any, b: any) =>{
    if(a.typePriority != b.typePriority){
        return a.typePriority - b.typePriority;
    }
    if(a.type == "time" || a.type == "timePassed"){
        return a.moment.diff(b.moment);
    }
    return a.priority - b.priority;
}
export {getFilename, momentToRegex, getMetaFromNote, IsRecurringThisDay, isDueOrScheduled, isTime, isTimePassed, sortTasks};