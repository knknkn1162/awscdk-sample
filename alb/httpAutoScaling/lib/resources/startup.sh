#!/bin/bash
yum -y update
yum install -y httpd
touch /var/www/html/index.html
echo "This is the server" > /var/www/html/index.html
systemctl enable httpd.service
systemctl start httpd.service