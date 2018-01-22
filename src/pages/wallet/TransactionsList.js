import React, { Component, Fragment } from 'react'
import ReactPaginate from 'react-paginate';
import { browserHistory } from 'react-router'
import TransactionItem from './TransactionItem'

class TransactionList extends Component {

  constructor(props) {
    super(props)

    this.handlePageClick = this.handlePageClick.bind(this)

    this.state = {
      pageCount: 10,
      transactions: [
        {id: 1, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'aKjmHRXCHg', sum: 0.21, fee: 0.0001},
        {id: 2, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'CkYKXUpNx1', sum: 1.54, fee: 0.0017},
        {id: 3, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'hYp2PcijCH', sum: 6.76, fee: 0.0023},
        {id: 4, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'hYp2PcijCH', sum: 0.34, fee: 0.0003},
        {id: 5, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'aKjmHRXCHg', sum: 0.21, fee: 0.0001},
        {id: 6, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'CkYKXUpNx1', sum: 1.54, fee: 0.0017},
        {id: 7, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'out', walletNumber: 'hYp2PcijCH', sum: 6.76, fee: 0.0023},
        {id: 8, time: this.randomDate(new Date(2012, 0, 1), new Date()), type: 'in', walletNumber: 'hYp2PcijCH', sum: 0.34, fee: 0.0003}
      ]
    }
  }

  randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  handlePageClick(data) {
    console.log(data)
    browserHistory.push(`/wallet/${data.selected+1}`);
  }

  hrefBuilder(page) {
    return `wallet/${page}`
  }

  render() {
    const page = parseInt(this.props.page, 10) || 1;

    return(
      <Fragment>
        <table className="table">
          <thead>
          <tr>
            <th>Time</th>
            <th>Type</th>
            <th>Wallet number</th>
            <th>Sum</th>
            <th>Fee</th>
          </tr>
          </thead>
          <tbody>
          {this.state.transactions.map(function(listItem){
            return <TransactionItem  key={listItem.id} item={listItem} />
          })}
          </tbody>
        </table>

        <ReactPaginate previousLabel={"previous"}
                       nextLabel={"next"}
                       breakLabel={<a href="">...</a>}
                       breakClassName={"break-me"}
                       pageCount={this.state.pageCount}
                       initialPage={page}
                       marginPagesDisplayed={2}
                       pageRangeDisplayed={5}
                       onPageChange={this.handlePageClick}
                       hrefBuilder={this.hrefBuilder}
                       containerClassName={"pagination"}
                       subContainerClassName={"pages pagination"}
                       activeClassName={"active"} />
      </Fragment>

    )
  }
}

export default TransactionList
