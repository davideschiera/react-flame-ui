/* global d3 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SDPanel from './sd-panel';
import SDPanelHeader from './sd-panel-header';
import SDPanelContent from './sd-panel-content';
import SDPanelFooter from './sd-panel-footer';
import SDPanelSidebar from './sd-panel-sidebar';
import SDLegend from './sd-legend';
import fmtTimeInterval from '../helpers/fmt-time-interval';
import FlameGraph from '../lib/flame-graph';

export default class extends Component {
    getSelector() {
        return `[data-reactid='${ReactDOM.findDOMNode(this).getAttribute("data-reactid")}']`;
    }

    constructor(props) {
        super(props);

        var me = this;

        me.chart = null;

        me.state = {
            colors:             d3.scale.category10(),
            lastColorIndex:     0,
            containerNames:     {},
            containerNameList:  [],
            chart:              null,
            activeSpan:         null,
            detailMode:         'popout',
            chartContext:       {
                detailClose: function() {
                    var svPopoutBox = d3.select(`${me.getSelector()} #svPopout`);
                    if (me.state.detailMode !== 'zoom') {
                        svPopoutBox.html('');
                        svPopoutBox.style('opacity', null);
                        svPopoutBox.style('z-index', null);
                    } else {
                        me.chart.zoomSet({ 'x': 0, 'dx': 1, 'y': 0 });
                    }
                },
                detailOpen: function svDetailOpen(d) {
                    function svMakeSubgraphData(d) {
                        /*
                         * First, construct everything from the current node to all of its
                         * leafs.
                         */
                        var tree, oldtree;

                        tree = {};
                        tree[d.data.key] = d.data.value;

                        while (d.parent !== undefined) {
                            oldtree = tree;
                            tree = {};
                            tree[d.parent.data.key] = {
                                't': d.parent.data.value.t,
                                'svTotal': d.parent.data.value.svTotal,
                                'ch': oldtree
                            };
                            d = d.parent;
                        }

                        return (tree);
                    }

                    var svPopoutBox = d3.select(`${me.getSelector()} #svPopout`);
                    if (me.state.detailMode !== 'zoom') {
                        svPopoutBox.html('');
                        new FlameGraph(
                            svPopoutBox,
                            svMakeSubgraphData(d),
                            null,
                            null,
                            me.state.chartContext,
                            {
                                getNodeColor:   me.getNodeColor.bind(me)
                            });
                        svPopoutBox.style('z-index', 1);
                        svPopoutBox.style('opacity', 1);
                    } else {
                        me.chart.zoomSet(d);
                    }
                },
                mouseout: function () {
                    me.setState({ activeSpan: null});
                },
                mouseover: function (d, det) {
                    me.setState({
                        activeSpan: {
                            name:           det.label,
                            container:      d.data.value.cont,
                            commandLine:    d.data.value.exe,
                            timeTotal:      fmtTimeInterval(d.data.value.tt, 3, 1).output,
                            timeInNode:     fmtTimeInterval(d.data.value.t, 3, 1).output,
                            childCount:     d.data.value.nconc
                        }
                    });
                },
                select: function(d) {
                    me.props.select(d);
                }
            }
        };
    }

    render() {
        return (
            <SDPanel className='flame-ui'>
                <SDPanelHeader>
                    <h1 className="title">{this.props.node} {this.props.op}</h1>
                    <div className="separator"></div>
                    <ul className="actions">
                        <li className="item">
                            <button className="button -flat -inline -primary">Hide legend</button>
                        </li>
                    </ul>
                </SDPanelHeader>

                <div className="flex-scaffholding -row">
                    <SDPanelContent className="flex-grow">
                        <div id="chart"></div>
                        <div style={{position: 'relative'}}>
                            <div id="svPopout"></div>
                        </div>
                    </SDPanelContent>

                    <SDPanelSidebar>
                        <SDLegend items={this.getLegendItems()}></SDLegend>
                    </SDPanelSidebar>
                </div>

                <XFooter span={this.state.activeSpan}></XFooter>
            </SDPanel>
        );
    }

    componentDidMount() {
        this.renderChart(this.props.data, this.props.node);
    }

    componentWillReceiveProps() {
        this.setInitialState();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.data !== prevProps.data || this.props.node !== prevProps.node) {
            //
            // You don't want to re-render the chart if props haven't changed. This temporary
            // fixes an issue with the chart updating data that will affect following re-render
            //
            this.destroyChart();
            this.renderChart(this.props.data, this.props.node);
        }
    }

    setInitialState() {
        this.setState({
            activeSpan: null
        });
    }

    renderChart(data) {
        this.chart = new FlameGraph(
            d3.select(`${this.getSelector()} #chart`),
            data,
            null,
            null,
            this.state.chartContext,
            {
                axisLabels:     true,
                getNodeColor:   this.getNodeColor.bind(this)
            }
        );
    }

    destroyChart() {
        d3.select(`${this.getSelector()} #chart`).html("");
    }

    getNodeColor(containerName) {
        var containerNames = this.state.containerNames;
        var color = containerNames[containerName];
        if (color === undefined) {
            color = this.state.colors(this.state.lastColorIndex);
            containerNames[containerName] = color;

            this.setState({
                containerNameList:  this.state.containerNameList.concat([containerName]),
                lastColorIndex:     this.state.lastColorIndex + 1
            });
        }

        return color;
    }

    getLegendItems() {
        var me = this;
        return this.state.containerNameList.map(function(containerName) {
            return {
                name:   containerName,
                color:  me.getNodeColor(containerName)
            };
        });
    }
}

class XFooter extends Component {
    render() {
        var content;
        var note;

        if (this.props.span) {
            content = <div>
                <strong>{this.props.span.name} informations –</strong>
                Container Name:                 <b>{this.props.span.container}</b>
                Command Line:                   <b>{this.props.span.container}</b>
                Time in this node and childs:   <b>{this.props.span.container}</b>
                Time in this node:              <b>{this.props.span.timeInNode}</b>
            </div>;

            if (this.props.span.childCount) {
                note = <div>
                    <br />
                    <strong>NOTE: this node has {this.props.span.childCount} childs. Only the slowest one is shown.</strong>
                </div>;
            }
        }

        return (
            <SDPanelFooter>
                {content}

                {note}
            </SDPanelFooter>
        );
    }
}