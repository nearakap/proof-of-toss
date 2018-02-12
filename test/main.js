var Main = artifacts.require("./Main.sol");
var Event = artifacts.require("./Event.sol");
var Token = artifacts.require("./Token.sol");

contract('Main', function(accounts) {
  it("should create new event and tranfer deposit. then deposit should returns", function() {
    var main, token, event;

    Token.deployed().then(function(instance) {
      token = instance;
    });

    return Main.deployed().then(function(instance) {

      main = instance;

      return main.getToken();

    }).then(function(tokenAddress) {

      assert.equal(tokenAddress, token.address, "mainSC token address not equals token address");

      return token.balanceOf(accounts[0], {from: accounts[1]});

    }).then(function(balance) {

      assert.equal(balance, 1000000000, "1000000000 tokens wasn't on balance");

      return token.transfer(accounts[1], 1000000000, {from: accounts[0]});

    }).then(function() {

      return token.balanceOf(accounts[1], {from: accounts[1]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 1000000000, "1000000000 tokens wasn't on account[1] balance");

      return token.approve(main.address, 1000, {from: accounts[1]});

    }).then(function() {

      const tags = 'en.tag1_name.en.tag2_name.en.tag3_name';
      const results = '"result_description_1.10.5.7"';

      return main.newEvent('Test event', 1000, 'en', 'category_id', 'description', 1,
        1517406195, 1580478195, 'source_url', tags, results, {from: accounts[1]});

    }).then(function(eventAddress) {

      return main.getLastEvent(eventAddress);

    }).then(function(eventAddress) {

      event = Event.at(eventAddress);

      return event.getToken();

    }).then(function(tokenAddress) {

      assert.equal(tokenAddress, token.address, "event token address not equals token address");

      return event.getCreatedTimestamp();

    }).then(function(timestamp) {

      console.log(timestamp);

      return event.getCreator();

    }).then(function(creator) {

      console.log(creator);

      assert.equal(creator, accounts[1], "wrong creator");

      return event.getShare(accounts[1], {from: accounts[1]})

    }).then(function(share) {

      assert.equal(share.toNumber(), 1000, "1000 tokens wasn't on deposit");

      return token.balanceOf(accounts[1], {from: accounts[1]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 999999000, "creator balance wasn't 999999000 tokens");

      return event.withdraw({from: accounts[1]});

    }).then(function() {

      return token.balanceOf(accounts[1], {from: accounts[1]});

    }).then(function(balance) {

      assert.equal(balance.toNumber(), 1000000000, "1000000000 tokens wasn't on balance");

      return event.getShare(accounts[1], {from: accounts[1]})

    }).then(function(share) {
      assert.equal(share.toNumber(), 0, "deposit wasn't withdrawn");
    });
  });
});
