/*!
 * Iguana api config
 *
 */

var apiProto = function() {};

var activeCoin,
    portsTested = false,
    isIguana = false,
    getInfoData = "",
    blockCount = "",
    connectionCount = 0;

apiProto.prototype.getConf = function(discardCoinSpecificPort) {
  var conf = {
      "server": {
        "protocol": "http://",
        "ip": "localhost",
        "iguanaPort": "7778"
      },
      "coins": {
        "btc": {
          "services": 129,
          "portp2p": 8332
        },
        "btcd": {
          "services": 0,
          "portp2p": 14632
        }
      }
  };

  // coin port switch hook
  if (activeCoin && !discardCoinSpecificPort)
    conf.server.port = conf.coins[activeCoin].portp2p;
  else
    conf.server.port = conf.server.iguanaPort;

  return conf;
}

apiProto.prototype.errorHandler = function(response) {
  if (response.error === "need to unlock wallet") {
    console.log("unexpected crash or else");;
  }
}

// test must be hooked to initial gui start or addcoin method
// test 1 port for a single coin
apiProto.prototype.testCoinPorts = function() {
  var result = false; /*,
      repeat = 3; // check default port, port+1, port-1*/

  $.each(apiProto.prototype.getConf().coins, function(index, conf) {
    var fullUrl = isIguana ? apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ":" + conf.portp2p + "/api/bitcoinrpc/getinfo" : proxy + apiProto.prototype.getConf().server.ip + ":" + conf.portp2p;
    var postData = isIguana ? "" : "{ \"agent\": \"bitcoinrpc\", \"method\": \"getinfo\", \"params\": [] }";
    var postAuthHeaders = isIguana ? "" : { "Authorization": "Basic " + btoa(conf.user + ":" + conf.pass) };

    $.ajax({
      url: fullUrl,
      cache: false,
      async: false,
      dataType: "json",
      type: "POST",
      data: postData,
      headers: postAuthHeaders,
      success: function (response) {
        console.log(response);
        if (response.result.walletversion || response.result === "success") {
          console.log('portp2p con test passed');
          console.log(index + ' daemon is detected');
          activeCoin = index;
          getInfoData = response;
        }
        if (response.status)
          if (response.status.indexOf(".RT0 ") > -1) console.log("RT is not ready yet!");
      },
      error: function (response) {
        console.log(response.responseText);
      }
    });
  });

  if (!activeCoin) console.log("no coin detected, at least one daemon must be running!");

  return result;
}

// check if iguana is running
apiProto.prototype.testConnection = function() {
  var result = false;

  // test if iguana is running
  var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ":" + apiProto.prototype.getConf().server.iguanaPort;
  $.ajax({
    url: defaultIguanaServerUrl + "/api/iguana/getconnectioncount",
    cache: false,
    dataType: "text",
    async: false,
    type: 'GET',
    success: function (response) {
      connectionCount = response;
      // iguana env
      console.log('iguana is detected');
      isIguana = true;
      apiProto.prototype.testCoinPorts();
    },
    error: function (response) {
      // non-iguana env
      console.log('running non-iguana env');
      apiProto.prototype.testCoinPorts();
    }
  });

  portsTested = true;
}

apiProto.prototype.getBlockcount = function() {
  var result = false;

  // test if iguana is running
  var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ":" + apiProto.prototype.getConf().server.iguanaPort;
  $.ajax({
    url: defaultIguanaServerUrl + "/api/bitcoinrpc/getblockcount",
    cache: false,
    dataType: "text",
    async: false,
    type: 'GET',
    success: function (response) {
      blockCount = response;
    },
    error: function (response) {
      console.log(response);
    }
  });
}

apiProto.prototype.getBlockHash = function(height) {
  var result = false;

  var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ":" + apiProto.prototype.getConf().server.iguanaPort;
  $.ajax({
    url: defaultIguanaServerUrl + "/api/bitcoinrpc/getblockhash?height=" + height,
    cache: false,
    dataType: "text",
    async: false,
    type: 'GET',
    success: function (response) {
      result = response;
    },
    error: function (response) {
      result = false;
      console.log(response);
    }
  });

  return result;
}

apiProto.prototype.getBlock = function(hash) {
  var result = false;

  var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ":" + apiProto.prototype.getConf().server.iguanaPort;
  console.log(defaultIguanaServerUrl + "/api/bitcoinrpc/getblock?blockhash=" + hash + "&verbose=1");
  $.ajax({
    url: defaultIguanaServerUrl + "/api/bitcoinrpc/getblock?blockhash=" + hash + "&verbose=1",
    cache: false,
    dataType: "text",
    async: false,
    type: 'GET',
    success: function (response) {
      result = response;
    },
    error: function (response) {
      result = false;
      console.log(response);
    }
  });

  return result;
}

apiProto.prototype.getTransaction = function(txid) {
  var result = false;

  var defaultIguanaServerUrl = apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ":" + apiProto.prototype.getConf().server.iguanaPort;
  console.log(defaultIguanaServerUrl + "/api/bitcoinrpc/gettransaction?txid=" + txid);
  $.ajax({
    url: defaultIguanaServerUrl + "/api/bitcoinrpc/gettransaction?txid=" + txid,
    cache: false,
    dataType: "text",
    async: false,
    type: 'GET',
    success: function (response) {
      result = response;
    },
    error: function (response) {
      result = false;
      console.log(response);
    }
  });

  return result;
}

apiProto.prototype.getServerUrl = function(discardCoinSpecificPort) {
  return apiProto.prototype.getConf().server.protocol + apiProto.prototype.getConf().server.ip + ":" + apiProto.prototype.getConf(discardCoinSpecificPort).server.port + "/api/";
}

apiProto.prototype.testConnection(); // run this everytime a page is (re)loaded