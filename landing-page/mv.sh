#!/bin/bash

aws s3 mv s3://persistolabs.com/images/daniel_bw.JPG s3://persistolabs.com/images/daniel_bw.jpg  --profile persisto --acl public-read
aws s3 mv s3://persistolabs.com/images/darion_bw.JPG s3://persistolabs.com/images/darion_bw.jpg  --profile persisto --acl public-read
aws s3 mv s3://persistolabs.com/images/gabriela_bw.JPG s3://persistolabs.com/images/gabriela_bw.jpg  --profile persisto --acl public-read
aws s3 mv s3://persistolabs.com/images/michael_bw.JPG s3://persistolabs.com/images/michael_bw.jpg  --profile persisto --acl public-read