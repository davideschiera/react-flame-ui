import React, { Component } from 'react';

export default class extends Component {
    render() {
        return (
            <div className={'sd-panel-footer ' + this.props.className}>
                {this.props.children}
            </div>
        );
    }
}