---
layout: post
title: 'gRPC Services Testing: Stop Using JSON, You Cowards'
date: 2024-02-29
category: QA
slug: grpc-services-testing
gpgkey: EBE8 BD81 6838 1BAF
tags:

- qa
- testing
---## Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [TL;DR](#tldr)
- [The "Binary" Problem](#the-binary-problem)
- [Testing Streams (The Hard Part)](#testing-streams-the-hard-part)
- [Code Snippet: Testing gRPC with Python](#code-snippet-testing-grpc-with-python)
- [Summary](#summary)
- [Key Takeaways](#key-takeaways)
- [Next Steps](#next-steps)

## Introduction

gRPC is fast. It uses HTTP/2 and Protocol Buffers.

It is also a pain in the neck to test because you cannot just `curl` it (well, you can with `grpcurl`, but you know what I mean).

Developers love it because "It's typed!" QA hates it because "Where is my JSON response? What is this binary rubbish?"

## TL;DR

- **Tooling differs from REST**: Throw away Postman (unless you have the update). Use **Kreya** or **BloomRPC**.
- **Schema is the Bible**: The `.proto` file is your Bible. If it changes, your tests break.
- **Mocking requires service-level mock**: You need to mock the *Service*, not just the HTTP endpoint.

## The "Binary" Problem

In REST, you can guess the payload. `{ "id": 1 }`.
In gRPC, the payload is `0a 01 08 01`.

If you do not have the `.proto` file, you are blind. QA must have access to the *source of truth* schemas. Ideally, these are in a separate repo (e.g., `schema-registry`) that both Dev and QA check out.

## Testing Streams (The Hard Part)

gRPC is not just Request/Response. It supports:

1. **Unary**: Standard Req/Res.
2. **Server Streaming**: One request, 100 responses.
3. **Client Streaming**: 100 requests, one response.
4. **Bidirectional**: Chaos.

Test the timeout. If the server streams data for 10 minutes, does the client timeout after 30 seconds?

## Code Snippet: Testing gRPC with Python

We use `grpc_testing` or just standard `pytest` with a generated client.

```python
# test_grpc.py
import grpc
import pytest
from generated import payment_pb2, payment_pb2_grpc

@pytest.fixture
def grpc_stub():
    # In secure environments, this would be grpc.secure_channel(credentials)
    channel = grpc.insecure_channel('localhost:50051')
    return payment_pb2_grpc.PaymentServiceStub(channel)

def test_process_payment(grpc_stub):
    # Create the typed request object
    request = payment_pb2.PaymentRequest(
        user_id="123",
        amount=99.99,
        currency="GBP"
    )
    
    try:
        # Always set a timeout/deadline.
        response = grpc_stub.ProcessPayment(request, timeout=5)
        
        # In gRPC, success is usually just "no exception thrown" 
        # but check the internal status too.
        assert response.status == payment_pb2.SUCCESS
        print(f"Transaction ID: {response.transaction_id}")
        
    except grpc.RpcError as e:
        pytest.fail(f"gRPC Call failed: {e.code()} - {e.details()}")

# Note: You must generate the Python code from the .proto file first!
# python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. payment.proto
```

## Summary

gRPC is the future of internal microservices (whether you like it or not). Stop being afraid of the binary. Embrace the schema.

At least you never have to parse a Date string again.

## Key Takeaways

- **Deadlines are mandatory**: Always set a deadline (timeout). Default is "Forever".
- **Error Codes differ from HTTP**: gRPC has its own status codes (`NOT_FOUND`, `UNAVAILABLE`). Do not expect HTTP 404.
- **Reflection aids discovery**: Enable "Server Reflection" in non-prod environments so tools can discover the schema automatically.

## Next Steps

- **Download**: Get **BloomRPC** (deprecated) or **Kreya** (current). They are the "Postman for gRPC".
- **Automate**: Add a "Lint Check" for your `.proto` files using `buf` (it catches breaking changes).
- **Ask**: "Why are we using gRPC for a public API?" (You probably should not be; it is bad for browsers).
