import React, { Component } from 'react';

export default class extends Component {
    render() {
        return (
            <div className='sd-panel-content'>
                {this.props.content}
            </div>
        );
    }
}