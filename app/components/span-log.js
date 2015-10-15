import React, { Component } from 'react';
import SDPanel from './sd-panel';
import SDPanelHeader from './sd-panel-header';
import SDPanelContent from './sd-panel-content';

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isChildrenLogVisible: false
        };
    }

    render() {
        var log = this.getLines().map(function(line, index) {
            return <li key={index}>
                <span style={{color: line.contCol}}>{line.containerName}</span>
                <span style={{color: line.col}}>({line.k}) {line.t} {line.b}</span>
            </li>
        });

        return (
            <SDPanel className='span-log'>
                <SDPanelHeader>
                    <h1 className="title">
                        Logs for
                        <a href="#0" onClick={this.showChildrenLog.bind(this, false)}>this span only</a> - <a href="#0" onClick={this.showChildrenLog.bind(this, true)}>this span and childs</a>
                    </h1>
                </SDPanelHeader>

                <SDPanelContent>
                    <ul>
                        {log}
                    </ul>
                </SDPanelContent>
            </SDPanel>
        );
    }

    getLines() {
        function svAddChildLogs(loglist, dk, dv, retnow) {
            if (dv.logs !== undefined) {
                for (var j = 0; j < dv.logs.length; j++) {
                    dv.logs[j].k = dk;
                    dv.logs[j].d = dv;
                }

                Array.prototype.push.apply(loglist, dv.logs);
            }

            if (retnow === true) {
                return;
            }

            var childs = dv.ch;
            for (var ch in childs) {
                svAddChildLogs(loglist, ch, childs[ch]);
            }
        }

        var d = this.props.span;
        var isChildrenLogVisible = this.state.isChildrenLogVisible;

        var loglist = [];

        if (isChildrenLogVisible === false) {
            svAddChildLogs(loglist, d.data.key, d.data.value, true);
        } else {
            svAddChildLogs(loglist, d.data.key, d.data.value);
            loglist.sort(function (a, b) {
                if (a.th === b.th) {
                    return a.tl - b.tl;
                } else {
                    return a.th - b.th;
                }
            });
        }

        var lines = [];
        for (var j = 0; j < loglist.length; j++) {
            var logLine = loglist[j].b.toLowerCase();
            var col;

            //
            // Determine the log text color
            //
            if (logLine.indexOf("err") > -1) {
                col = '#ff0000';
            } else if (logLine.indexOf("warn") > -1) {
                col = '#ff8800';
            } else {
                col = '#000000';
            }

            //
            // Determine the container color
            //
            var containerName = loglist[j].d.cont;

            var contCol = '#000000'; // TODO = getNodeColor(containerName);

            lines[j] = {
                contCol:    contCol,
                containerName:      containerName,
                col:        col,
                k:          loglist[j].k,
                t:          loglist[j].t,
                b:          loglist[j].b
            };
        }

        return lines;
    }

    showChildrenLog(show) {
        this.setState({
            isChildrenLogVisible: show
        });
    }
}