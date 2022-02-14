#! /bin/sh
twilio api:studio:v2:flows:update \
--sid FW486977cd42857eb128281e156d62c673 \
--commit-message "Update test" \
--status published \
--definition "`cat flows/call.json`"
-p Joyzo