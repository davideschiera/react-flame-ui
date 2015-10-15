import React, { Component } from 'react';
import SDPanelHeader from './sd-panel-header';
import SDPanelContent from './sd-panel-content';

export default class extends Component {
    render() {
        return (
            <div className={'sd-panel ' + this.props.className}>
                {this.props.children}
            </div>
        );
    }
}