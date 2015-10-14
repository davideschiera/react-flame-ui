import React, { Component } from 'react';

export default class extends Component {
    render() {
        return (
            <div className='sd-panel-header'>
                {this.props.content}
            </div>
        );
    }
}