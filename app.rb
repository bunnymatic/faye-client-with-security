# -*- coding: utf-8 -*-
require 'rubygems'
require 'sinatra/base'
require 'eventmachine'
require 'faye'


FAYE_SERVER_URL = ENV['FAYE_SERVER_URL'] || 'http://localhost:3030/maumessages'; #mau-messages.herokuapp.com:80/maumessages';
SUBSCRIBER_TOKEN = ENV['FAYE_SUBSCRIBER_TOKEN'] || 'whatevs_yo'

class ClientAuth
  def outgoing(msg,cb)
    if msg['channel'] == '/meta/subscribe'
      msg['ext'] ||= {}
      msg['ext']['subscriberToken'] = SUBSCRIBER_TOKEN
    end
    cb.call msg
  end
end

class WebFrontApp < Sinatra::Base
  
  configure do
    set :public_folder, Proc.new { File.join(root, "static") }
    enable :sessions
  end

  get '/' do
    erb :index
  end

end

emthread = Thread.new {
  EM.run {  
    begin
      client = Faye::Client.new(FAYE_SERVER_URL)
      client.add_extension(ClientAuth.new)
      client.subscribe('/tweedledee') do |msg|
        puts "[tweedledee] #{msg}"
      end
      
      client.subscribe('/tweedledum') do |msg|
        puts "[tweedledum] #{msg}"
      end
    rescue Exception => ex
      p  "Faye server failed: ", ex
    end
  }
}
