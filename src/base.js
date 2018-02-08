"use strict";

/*
 * Copyright (C) 2018 Marius Gripsgard <marius@ubports.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

class Base {
  constructor(name, jobs, options) {
    this.name = name;

    // All jobs
    this.jobs = [];

    // Jobs that wathing to run
    this.runnableJobs = [];

    // be able to check if we are a job;
    this.isAJob = true;

    const _this = this;
    // Sort jobs
    jobs.forEach((job) => {
      if (job.isAJob) {
        _this.jobs.push({
          name: job.name,
          func: () => {return job.run()},
          job: job,
        });
      } else {
        _this.jobs.push(job);
      }
    });

    var dups = [];
    this.names.forEach(job => {
      if (dups.includes(job))
        throw "Promise " + job + " alredy exist";
      dups.push(job);
    })

    this.rejectedJobs = [];
    this.doneJobs = [];
    this.on = {};
    this.onErr = {};
    this.forwardArguments = {};

    this.startAmount = this.length;
  }

  run(name, ready) {
    if (this.running)
      throw "Alredy running!";
    this.running = true;

    if (!ready) {
      if (name) {
        if (!this.exists(name))
          throw "run: Cannot find " + name
        this.runnableJobs = [this.find(name)]
      } else {
        this.runnableJobs = this.jobs.slice();
      }
    }
  }

/*
  runTo(name) {
    if (!this.exists(name))
      throw "run: Cannot find " + name
    var jobs = this.jobs.slice(this.jobs.indexOf(name));
    this.runnableJobs = jobs
    this.run("", ready)
  }

  runFrom(name) {

    this.run("", ready)
  }

  runFromTo(from, to) {

    this.run("", ready)
  }

  haltOn(name) {

    this.run("", ready)
  }
*/


  // We can't use Promise.all since we need to inject our "on" function
  next() {
    // Make sure we are working on this (even inside Promises)
    const _this = this;

    // This should never happen; unless next is called directly!
    if (_this.length <= 0)
      throw "Out of jobs";

    // Get next job in the array
    const job = _this.runnableJobs.shift();
    if (!job.argument)
      job.argument = [];

    if (this.forwardArguments[job.name]) {
      job.argument = {
        forwarded: this.forwardArguments[job.name],
        original: job.argument
      };
    }

    return job.func(job.argument).then((r) => {
      if (job.forwardReturnTo) {
        if (!this.forwardArguments[job.forwardReturnTo])
          this.forwardArguments[job.forwardReturnTo] = {}
        this.forwardArguments[job.forwardReturnTo][job.name] = r;
      }
      if (_this.on[job.name]) {
        for (var on in _this.on[job.name]) {
          _this.on[job.name][on](r);
        }
      }
      _this.doneJobs.push(job);
      return r;
    }).catch((e) => {
      if (_this.onErr[job.name]) {
        for (var on in _this.onErr[job.name]) {
          _this.onErr[job.name][on](r);
        }
      }
      _this.rejectedJobs.push(job);
      return e;
    });
  }

  get length() {
    return this.jobs.length;
  }

  get runnableLenght() {
    return this.runnableJobs.length;
  }

  get jobsDone() {
    return this.doneJobs.length;
  }

  get jobsRejected() {
    return this.rejectedJobs.length;
  }

  isDone() {
    return (this.jobsDone + this.jobsRejected) == this.startAmount;
  }

  // TODO: find a method to make these promisses!
  onResolve(name, callback) {
    //
    var ret = false;
    this.jobs.forEach(job => {
      if (job.name == name) {
        if (!this.on[name])
          this.on[name] = [];
        this.on[name].push(callback);
        ret = true;
        return ret;
      }
      if (job.job) {
        if (job.job.exists(name)) {
          ret = job.job.onResolve(name, callback);
          return ret;
        }
      }
    });

    if (!ret)
      throw "onResolve: Could not find " + name;

    return ret;
  }

  onReject(name, callback) {
    var ret = false;
    this.jobs.forEach(job => {
      if (job.name == name) {
        if (!this.onErr[name])
          this.onErr[name] = [];
        this.onErr[name].push(callback);
        ret = true;
        return ret;
      }
      if (job.job) {
        if (job.job.exists(name)) {
          ret = job.job.onResolve(name, callback);
          return ret;
        }
      }
    });

    if (!ret)
      throw "onResolve: Could not find " + name;

    return ret;
  }

  get names() {
    var names = [];
    this.jobs.forEach(job => {
      names.push(job.name);
      if (job.job) {
        names = names.concat(job.job.names);
      }
    });
    return names;
  }

  get runnableNames() {
    var names = [];
    this.runnableJobs.forEach(job => {
      names.push(job.name);
    });
    return names;
  }

  exists(name) {
    var ret = false;
    this.jobs.forEach(job => {
      if (job.name == name) {
        ret = true;
        return true;
      }
      if (job.job) {
        if (job.job.exists(name)) {
          ret = true;
          return true;
        }
      }
    });
    return ret;
  }

  find(name) {
    var ret = false;
    this.jobs.forEach(job => {
      if (job.name == name) {
        ret = job;
        return true;
      }
      if (job.job) {
        if (job.job.exists(name)) {
          ret = job.job.find(name);
          return true;
        }
      }
    });
    return ret;
  }
}

module.exports = Base;
