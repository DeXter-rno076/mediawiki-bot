import fs from 'fs';

const logDirPath = './botlogs';

/*
TODO somehow manage to make it possible to return into the last task if program execution addidently stopped
TODO when mainlog.json got removed give existing txt files new names or put them in an archive directory or similar, otherwise they would get overwritten
*/

export function logInit (bot) {
    try {
        fs.accessSync('./botlogs');
    } catch (error) {
        //if botlogs dir doesn't exist, an error is thrown and the dir is set up
        setUpDirectoryStructure();
    }
    cleanUpLogFiles();

    newJob(bot);//creates new job and sets taskId for the logging stuff
    bot.editActions.taskId = bot.taskId;
}

function setUpDirectoryStructure () {
    fs.mkdirSync(logDirPath);
    fs.mkdirSync(logDirPath + '/consoleOutputs');
    fs.writeFileSync(logDirPath + '/mainlog.json', JSON.stringify([]));
}

function newJob (bot) {
    let jobs;
    try {
        jobs = JSON.parse(fs.readFileSync(logDirPath + '/mainlog.json', {encoding: 'utf8'}));
    } catch (error) {
        jobs = [];
        fs.writeFileSync(logDirPath + '/mainlog.json', '');
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

    fs.writeFileSync(logDirPath + '/mainlog.json', JSON.stringify(jobs));

    fs.writeFileSync(logDirPath + '/consoleOutputs/' + newId + '.txt', '');

    bot.taskId = newId;
}

export function saveConsoleOutput (message, taskId) {
    fs.appendFileSync(logDirPath + '/consoleOutputs/' + taskId + '.txt', message + '\n');
}

function cleanUpLogFiles () {
    const mainlog = JSON.parse(fs.readFileSync(logDirPath + '/mainlog.json', {encoding: 'utf8'}));
    if (mainlog.length === 0) {
        return;
    }

    for (let i = 0; i < mainlog.length; i++) {
        const taskId = mainlog[i].id;
        const taskFilePath = logDirPath + '/consoleOutputs/' + taskId + '.txt';
        const logFile = fs.readFileSync(taskFilePath, {encoding: 'utf8'});

        //a file with only a login message has two lines
        //a file with only a login and a logout message has three lines
        if (logFile.split('\n').length <= 2 || (logFile.split('\n').length <= 3 && logFile.search('logout') !== -1)) {
            //if only one or none lines were written to the log file it gets deleted
            fs.unlinkSync(taskFilePath);
            mainlog.splice(i, 1);
            i--;
        }
    }
    fs.writeFileSync(logDirPath + '/mainlog.json', JSON.stringify(mainlog));
}