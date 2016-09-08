/*!
 * Iguana dashboard
 *
 */

var blocksPerPage = 20,
    maxBlocks = 800,
    currentPage = 0,
    decrementBlockHeightBy = 1000,
    explorerUpdateTimout = 15; // sec

function updateStats() {
  var statusLine = getInfoData.status.split(' ');
  var totalBundles = statusLine[20].split(':');
  var api = new apiProto();
  api.testCoinPorts();
  api.getBlockcount();

  $('.dashboard .connections .count').html($.parseJSON(connectionCount).result);
  $('.icon-coin').addClass(' ' + getInfoData.coin + '-alt');
  $('.icon-coin-name').html(getInfoData.coin);
  $('.bundles .current').html(statusLine[14].replace('E.', ''));
  $('.bundles .total').html(totalBundles[0]);
  $('.blocks .current').html($.parseJSON(blockCount).result);

  if (currentPage === 0) {
    $(".transactions-list-repeater").html(constructBlocksRepeater());
    bindClickInBlocksRepeater();
  }

  if (getInfoData.status.indexOf(".RT0 ") === -1)
    $('.realtime-mode').addClass('ready');
  else
    $('.realtime-mode').removeClass('ready');
}

function updateBlockRepeater(newPage) {
  $(".transactions-list-repeater").html(constructBlocksRepeater(newPage));
  bindClickInBlocksRepeater();
}

$(document).ready(function() {
  var helper = new helperProto();

  updateStats();

  var dashboardUpdateTimer = setInterval(function() {
    console.clear();
    updateStats();
    console.log("explorer updated");
  }, explorerUpdateTimout * 1000);

  $(".block-info .btn-close").click(function() {
    helper.toggleModalWindow("block-info", 300);
  });

  $(".btn-search").click(function() {
    var searchQuery = $('.quick-search .text').val();
    var api = new apiProto();

    if ($('.quick-search .text').val().length < 10) {
      var searchBlockHash = $.parseJSON(api.getBlockHash(searchQuery));
      getBlockInfo(searchBlockHash);
    } else {
      var searchBlock = $.parseJSON(api.getBlock(searchQuery));

      if (searchBlock.result === 'success') {
        getBlockInfo(searchBlock);
      } else {
        var searchTx = $.parseJSON(api.getTransaction(searchQuery));
        if (searchTx.timestamp) {
          getTxInfoModal(searchQuery);
        }
      }
    }
  });
});

var blocksRepeater = "<div class=\"item {{ status_class }} {{ timestamp_format }}\">" +
                                "<div class=\"status\">{{ status }}</div>" +
                                "<div class=\"hash\">{{ hash }}</div>" +
                                "<div class=\"amount\">{{ amount }}</div>" +
                                "<div class=\"txcount\">{{ txcount }}</div>" +
                                "<div class=\"timestamp\">{{ timestamp_single }}</div>" +
                                "<div class=\"timestamp two-lines\">" +
                                  "<span class=\"timestamp-date\">{{ timestamp_date }}</span>" +
                                  "<span class=\"timestamp-time\">{{ timestamp_time }}</span>" +
                                "</div>" +
                              "</div>";

function constructBlocksRepeater(newPage) {
  var api = new apiProto();
  var helper = new helperProto();
  var blockHash;
  var block;
  var result = "";
  currentPage = newPage ? newPage : 0;
  var currentBlockHeight = $.parseJSON(blockCount).result - decrementBlockHeightBy - currentPage * blocksPerPage;
  var pagerHTML = "";

  for (var i=0; i < Math.floor(maxBlocks/blocksPerPage); i++) {
    var activePageClass = "";
    if (currentPage === i) activePageClass = ' active';
    pagerHTML += '<div class=\"page' + activePageClass + '\" onclick=\"updateBlockRepeater(' + i + ')\">' + (i + 1) + '</div>';
  }
  $('.pager1, .pager2').html(pagerHTML);

  result += blocksRepeater.replace("{{ status_class }}", "header").
                                    replace("{{ status }}", "<strong>Block</strong>").
                                    replace("{{ hash }}", "<strong>Hash</strong>").
                                    replace("{{ amount }}", "<strong>Amount</strong>").
                                    replace("{{ txcount }}", "<strong>Tx count</strong>").
                                    replace("{{ timestamp_format }}", "timestamp-multi").
                                    replace("{{ timestamp_date }}", "<strong>Time</strong>").
                                    replace("{{ timestamp_time }}", "");

  for (var i=0; i < blocksPerPage; i++) {
    blockHash = api.getBlockHash(currentBlockHeight - i);
    block = api.getBlock($.parseJSON(blockHash).result);
    block = $.parseJSON(block);
    //console.log(block);

    result += blocksRepeater.replace("{{ status }}", currentBlockHeight - i).
                                      replace("{{ hash }}", $.parseJSON(blockHash).result).
                                      replace("{{ amount }}", "N/A").
                                      replace("{{ txcount }}", block.txn_count).
                                      replace("{{ timestamp_format }}", "timestamp-multi").
                                      replace("{{ timestamp_date }}", helper.convertUnixTime(block.timestamp, "DDMMMYYYY")).
                                      replace("{{ timestamp_time }}", helper.convertUnixTime(block.timestamp, "HHMM"));
  }

  return result;
}

function bindClickInBlocksRepeater() {
  $('.transactions-list-repeater .item').each(function(index, item) {
    $(this).click(function() {
      var api = new apiProto();
      var helper = new helperProto();
      var blockInfo = $.parseJSON(api.getBlock($(this).find('.hash').html()));
      var blockInfoHTML = "";

      for (var prop in blockInfo) {
        var tx,
            txHTML = '';
        if (prop === 'timestamp') {
          blockInfo[prop] = helper.convertUnixTime(blockInfo[prop], "DDMMMYYYY") + ' ' + helper.convertUnixTime(blockInfo[prop], "HHMM");
        }
        if (prop === 'tx') {
          for (var i=0; i < blockInfo[prop].length; i++) {
            if (blockInfo[prop].length)
              txHTML += '<div class=\"link\" onclick=\"getTxInfo(\'' + blockInfo[prop][i] + '\')\"><i class=\"bi_interface-view\"></i>' + blockInfo[prop][i] + '</div>' +
                        '<div class=\"tx-info-' + blockInfo[prop][i] +'\"></div>';
          }
          blockInfo[prop] = txHTML;
        }
        blockInfoHTML += '<div class=\"block-info-row\">' +
                           '<span class=\"block-prop\"><strong>' + prop + '</strong></span>' +
                           '<span class=\"block-val\">' + blockInfo[prop] + '</span>' +
                         '</div>';
      }
      $('.block-info .form-content .info').html(blockInfoHTML);
      helper.toggleModalWindow("block-info", 300);
    });
  });
}

function getTxInfo(txid) {
  if ($('.tx-info-' + txid).html().length > 10) {
    $('.tx-info-' + txid).html('');
  } else {
    var api = new apiProto();
    var helper = new helperProto();
    var txInfo = $.parseJSON(api.getTransaction(txid));
    var txInfoHTML = "";

    for (var prop in txInfo) {
      if (prop === 'blocktime' || prop === 'timestamp') {
        txInfo[prop] = helper.convertUnixTime(txInfo[prop], "DDMMMYYYY") + ' ' + helper.convertUnixTime(txInfo[prop], "HHMM");
      }
      txInfoHTML += '<div class=\"block-info-row\">' +
                      '<span class=\"block-prop\"><strong>' + prop + '</strong></span>' +
                      '<span class=\"block-val\">' + txInfo[prop] + '</span>' +
                    '</div>';
    }
    $('.tx-info-' + txid).html(txInfoHTML);
  }
}

function getBlockInfo(hash, suppress) {
  var api = new apiProto();
  var helper = new helperProto();
  var blockInfo = $.parseJSON(api.getBlock(suppress ? hash : (hash.hash || hash.result)));
  var blockInfoHTML = "";

  for (var prop in blockInfo) {
    var tx,
        txHTML = '';
    if (prop === 'timestamp') {
      blockInfo[prop] = helper.convertUnixTime(blockInfo[prop], "DDMMMYYYY") + ' ' + helper.convertUnixTime(blockInfo[prop], "HHMM");
    }
    if (prop === 'tx') {
      for (var i=0; i < blockInfo[prop].length; i++) {
        if (blockInfo[prop].length)
          txHTML += '<div class=\"link\" onclick=\"getTxInfo(\'' + blockInfo[prop][i] + '\')\"><i class=\"bi_interface-view\"></i>' + blockInfo[prop][i] + '</div>' +
                    '<div class=\"tx-info-' + blockInfo[prop][i] +'\"></div>';
      }
      blockInfo[prop] = txHTML;
    }
    blockInfoHTML += '<div class=\"block-info-row\">' +
                       '<span class=\"block-prop\"><strong>' + prop + '</strong></span>' +
                       '<span class=\"block-val\">' + blockInfo[prop] + '</span>' +
                     '</div>';
  }

  $('.block-info .form-content .info').html(blockInfoHTML);
  if (!suppress) helper.toggleModalWindow("block-info", 300);
}

function getTxInfoModal(txid) {
  var api = new apiProto();
  var helper = new helperProto();
  var txInfo = $.parseJSON(api.getTransaction(txid));
  var txInfoHTML = "";

  for (var prop in txInfo) {
    if (prop === 'blocktime' || prop === 'timestamp') {
      txInfo[prop] = helper.convertUnixTime(txInfo[prop], "DDMMMYYYY") + ' ' + helper.convertUnixTime(txInfo[prop], "HHMM");
    }
    if (prop === 'blockhash') {
      txInfo[prop] = '<div class=\"link\" onclick=\"getBlockInfo(\'' + txInfo[prop] + '\', true)\"><i class=\"bi_interface-view\"></i>' + txInfo[prop] + '</div>';
    }
    txInfoHTML += '<div class=\"block-info-row\">' +
                    '<span class=\"block-prop\"><strong>' + prop + '</strong></span>' +
                    '<span class=\"block-val\">' + txInfo[prop] + '</span>' +
                  '</div>';
  }
  $('.block-info .form-content .info').html(txInfoHTML);
  helper.toggleModalWindow("block-info", 300);
}