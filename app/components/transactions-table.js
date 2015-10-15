import React, { Component } from 'react';
import SDPanel from './sd-panel';
import SDPanelHeader from './sd-panel-header';
import SDPanelContent from './sd-panel-content';

export default class extends Component {
    render() {
        var me = this;

        var lines = me.props.transactions.map(function(transaction, index) {
            return (
                <div key={index} className="row">
                    <b>{transaction.node}</b> - {transaction.n} calls -
                    <a onClick={me.props.select.bind(me, transaction.node, 'avg')}>Avg Time</a>: {transaction.avg}
                    <a onClick={me.props.select.bind(me, transaction.node, 'min')}>Min Time</a>: {transaction.min}
                    <a onClick={me.props.select.bind(me, transaction.node, 'max')}>Max Time</a>: {transaction.max}
                </div>
            );
        });

        return (
            <SDPanel className = 'transactions-table'>
                <SDPanelHeader>
                    <h1 className = 'title'>Transactions</h1>
                </SDPanelHeader>

                <SDPanelContent>
                    {lines}
                </SDPanelContent>
            </SDPanel>
        );
    }
}