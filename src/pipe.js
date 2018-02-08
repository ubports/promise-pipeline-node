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

const Base = require("./base.js")

class Pipe extends Base {
  constructor(name, line, options) {
    super(name, line, options);
  }

  run(name) {
    super.run(name);
    const _this = this;
    return new Promise(function(resolve, reject) {
      const names = _this.runnableNames;
      for (var job in names) {
        _this.next().then((r) => {
          if (_this.isDone() && !_this.resolved) {
            _this.resolved = true;
            resolve();
          }
          return r;
      }).catch(() => {});
      }
    });
  }
/*
  runTo() {

    this.run("", ready)
  }

  runFrom() {

    this.run("", ready)
  }

  runFromTo() {

    this.run("", ready)
  }

  haltOn() {

    this.run("", ready)
  }

  */
}

module.exports = Pipe;
