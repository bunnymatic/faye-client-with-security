$(function() {

  var thisclient;
  var thatclient;
  
  /** if you do not specify the port here, this will try to use the
      client port and communication with the server may fail */
  var subscription;

  var client = new Faye.Client(server_uri);
  var clientAuth = {
    outgoing: function(msg, cb) {
      if (msg.channel === '/meta/subscribe') {
        msg.ext = msg.ext || {};
        msg.ext.subscriberToken = SUBSCRIBER_AUTH_TOKEN;
      }
      cb(msg);
    }
  };
  /* heroku doesn't like websocket */
  client.disable('websocket');
  client.addExtension(clientAuth);
  $('#publish').bind('submit', function() {
    var msg = $(this).find('input#message').val();
    if (msg) {
      client.publish('/' + thisclient, {text:"["+thisclient+"] " + msg});
    }
    return false;
  });

  var subscribe = function(channel) {
    if(subscription) {
      subscription.cancel();
    }
    subscription = client.subscribe('/'+channel,  function(msg) {
      $('#messages li').removeClass('new');
      var safemsg = msg.text || msg;
      $('#messages').prepend($('<li class="new">').html(safemsg));
    });
    subscription.callback(function() {
      alert('You\'re now listenin to ' + channel);
    });
  };

  $('#clientsetup select').bind('change', function() {
    var clients = $('select option').each(function() {
      if ($(this).is(':checked')) {
        thisclient = this.value;
      } else {
        thatclient = this.value;
      } 
      console.log('this/that : ', thisclient, thatclient);
   });
    subscribe(thatclient);
  });            

  var clients = $('select option');
  thisclient = clients[0].value;
  thatclient = clients[1].value;
  subscribe(thatclient);


});
