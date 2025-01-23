#!/bin/bash

# Bind domain to local address so you will be able to access the project when developing it locally.
echo "Appending new line to /etc/hosts"
echo "127.0.0.1	naszrod.local" >> /etc/hosts