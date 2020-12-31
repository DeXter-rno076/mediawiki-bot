import fs from 'fs';

/*
TODO clean up functionality (jobs with no action or only login can be deleted)
*/

export function logInit () {
    fs.mkdirSync('./botlogs');
    fs.mkdirSync('./botlogs/consoleOutputs');
    fs.writeFileSync('./botlogs/mainlog.json', JSON.stringify([]));
}

export function newJob (bot) {
    let jobs;
    try {
        jobs = JSON.parse(fs.readFileSync('./botlogs/mainlog.json', {encoding: 'utf8'}));
    } catch (error) {
        jobs = [];
        fs.writeFileSync('./botlogs/mainlog.json', '');
    }

    let previousId;
    if (jobs.length === 0) {
        previousId = -1;
    } else {
        previousId = Number(jobs[jobs.length - 1].id);
    }

    let newId = previousId + 1;
    let time = new Date();
    let obj = {
        id: String(newId),
        timestamp: time.toISOString(),
        summary: bot.summary
    }

    jobs.push(obj);

    fs.writeFileSync('./botlogs/mainlog.json', JSON.stringify(jobs));

    fs.writeFileSync('./botlogs/consoleOutputs/' + newId + '.txt', '');

    bot.taskId = newId;
}

export function saveConsoleOutput (message, taskId) {
    fs.appendFileSync('./botlogs/consoleOutputs/' + taskId + '.txt', message + '\n');
}