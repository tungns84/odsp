---
trigger: always_on
---

# Hexagonal architecture (application service flavor)

**In a nutshell**, hexagonal architecture:

- Protects the domain model;
- Clearly separates business and infrastructure responsibilities.

## Goals

Here are some of the properties we are looking for when using this kind of architecture. Keeping them in mind while coding is really important!

## Where to put code

Finally, the architecture part you were looking for :P.

So, first things first: **an application is made of multiple "hexagons"**, one for each [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html). (Yes, sometimes you can have only one but this is an exception). We usually have each Bounded Context as root packages in the application.

Originally, this architecture was presented in a hexagon (hence the name) with the Domain Model at its center:

We can enforce this architecture with this folder organization:

- `my_business_context`: root package for the context (naming depends on your technology naming conventions)
  - `application`: contains the application layer code
  - `domain`: contains the business code
  - `infrastructure`:
    - `primary`: contains adapters implementations that drive your context
    - `secondary`: contains adapters implementations that your context drives

As said many times, each "part" here has a specific concern so let's follow the rabbit in that hole.

### Code in Domain Model

This is the code that really matters. You can build it using [Domain Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design) building blocks or any other tool that will help you build a clear representation of the business.

This model doesn't depend on anything and everything depends on it, so it is totally framework-agnostic, you just need to pick a language to build your Domain Model.

Apart from the code used to make the business operations we'll find ports in the Domain Model. Ports are `interfaces` that are used to invert dependencies. As the Domain Model sometimes needs ports for some operations, they can only be there since the Domain doesn't depend on anything.

### Code in Application

The application layer **MUST NOT CONTAIN ANY BUSINESS RULE**, its responsibilities are:

- Basic orchestration:
  - Get something from a port;
  - Make an operation on that thing (call a method on the object);
  - Save that thing using a port;
  - Dispatch created events using a port.
- Transactions management;
- Authorization check (this is the wiring point, the business for authorization must be in the domain).

### Code in Primary

The primary part contains adapters for the code driving our domain. Example: code to expose REST WebServices. This part depends a lot on frameworks and is responsible for making the best possible exposure of the business actions.

### Code in Secondary

The secondary part is made of adapters implementing the ports from the domain. This part depends a lot on frameworks and its responsibility is to make the best possible use of the infrastructure our business needs.