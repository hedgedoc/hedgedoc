# Events

!!! info "Design Document"
    This is a design document, explaining the design and vision for a HedgeDoc 2
    feature. It is not a user guide and may or may not be fully implemented.

In HedgeDoc 2, we use an event system based on [EventEmitter2][eventemitter2].
It's used to reduce circular dependencies between different services and inform these services
about changes.

HedgeDoc's system is basically [the system NestJS offers][nestjs/eventemitter].  
The config for the `EventEmitterModule` is stored in `events.ts` and
exported as `eventModuleConfig`. In the same file enums for the event keys are defined.
Each of these events is expected to be sent with an additional value.
In the enum definition a comment should tell you what exactly this value should be.

[eventemitter2]: https://github.com/EventEmitter2/EventEmitter2
[nestjs/eventemitter]: https://docs.nestjs.com/techniques/events
