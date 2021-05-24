/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// import Y from 'yjs';
// import { mutex, encoding } from 'lib0';
// import { Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
// import { debounce } from 'lodash';
// import { MessageType } from './message-type';
//
// class HedgeYDoc extends Y.Doc {
//   private name: string;
//   private mux: mutex.mutex;
//   /**
//    * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
//    * @type {Map<Object, Set<number>>}
//    */
//   private conns: Map<Object, Set<number>>; // FIXME Object type
//   private awareness: Awareness;
//
//   /**
//    * @param {string} noteId
//    */
//   constructor(noteId: string) {
//     super({ gc: true }); // ToDo: Should this really be true?
//     this.name = noteId;
//     this.mux = mutex.createMutex();
//     this.conns = new Map<Object, Set<number>>();
//
//     this.awareness = new Awareness(this);
//     this.awareness.setLocalState(null);
//     /**
//      * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
//      * @param {Object | null} conn Origin is the connection that made the change
//      */
//     const awarenessChangeHandler = (
//       changes: { added: number[]; updated: number[]; removed: number[] },
//       conn: Object | null, // FIXME generic Object
//     ) => {
//       const changedClients = changes.added.concat(
//         changes.updated,
//         changes.removed,
//       );
//       if (conn !== null) {
//         const connControlledIDs = this.conns.get(conn);
//         if (connControlledIDs !== undefined) {
//           changes.added.forEach((clientID) => {
//             connControlledIDs.add(clientID);
//           });
//           changes.removed.forEach((clientID) => {
//             connControlledIDs.delete(clientID);
//           });
//         }
//       }
//       // broadcast awareness update
//       const encoder = encoding.createEncoder();
//       encoding.writeVarUint(encoder, MessageType.AWARENESS);
//       encoding.writeVarUint8Array(
//         encoder,
//         encodeAwarenessUpdate(this.awareness, changedClients),
//       );
//       const buff = encoding.toUint8Array(encoder);
//       this.conns.forEach((_, c) => {
//         send(this, c, buff);
//       });
//     };
//     this.awareness.on('update', awarenessChangeHandler);
//     this.on('update', updateHandler);
//     if (isCallbackSet) {
//       this.on(
//         'update',
//         debounce(callbackHandler, CALLBACK_DEBOUNCE_WAIT, {
//           maxWait: CALLBACK_DEBOUNCE_MAXWAIT,
//         }),
//       );
//     }
//   }
// }
//
// const send = (doc, conn, m) => {
//   if (
//     conn.readyState !== wsReadyStateConnecting &&
//     conn.readyState !== wsReadyStateOpen
//   ) {
//     closeConn(doc, conn);
//   }
//   try {
//     conn.send(
//       m,
//       /** @param {any} err */ (err) => {
//         err != null && closeConn(doc, conn);
//       },
//     );
//   } catch (e) {
//     closeConn(doc, conn);
//   }
// };
