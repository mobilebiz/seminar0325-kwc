#! /bin/sh
twilio api:studio:v2:flows:create \
--commit-message "First commit" \
--status published \
--definition "`cat flows/call.json`" \
--friendly-name "承認コール"