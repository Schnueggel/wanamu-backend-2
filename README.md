New Version of the wanamu backend. In this version I will add nodejs clustering together with socketio,
enabling a fallback for socket.io long polling that still works with clustering.

I will also add the feature todo sharing. Something I skipped the last time.

# Install

To use this backend install redis and mongodb.

You need to setup up some environment vars to make this project run. See the bin folder there are some scripts to create a dev or test environment setup. 

Use env-test.sh for example to create environment for development.