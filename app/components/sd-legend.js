import React, { Component } from 'react';

export default class extends Component {
    render() {
        var items = this.props.items.map(function(item, index) {
            return <li key={index} className='item'>
                <i className='material-icons icon' style={{color: item.color}}>lens</i>
                <span className='text'>{item.name}</span>
            </li>

        });

        return (
            <ul className='sd-legend'>
                {items}
            </ul>
        );
    }
}