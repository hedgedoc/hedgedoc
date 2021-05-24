/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import WebSocket from 'ws';

// TODO Add unit tests

/**
 * Represents a mapping instance from WebSocket clients to a note and reverse.
 */
export class NoteClientMap {
  /** Internal map that holds a list of clients for a note identifier. */
  private noteIdToClients = new Map<string, WebSocket[]>();
  /** Internal map that holds the note identifier for a WebSocket connection. */
  private clientToNoteId = new Map<WebSocket, string>();

  /**
   * Adds a new WebSocket client - note identifier matching to the mapping instance.
   * @param client The WebSocket client. Must not be added to this mapping instance in beforehand.
   * @param noteId The internal id (from database) of the note that the client accesses.
   * @throws Error if the client already exists in this mapping instance.
   */
  public addClient(client: WebSocket, noteId: string): void {
    if (this.clientToNoteId.has(client)) {
      throw new Error('Client already exists in map');
    }
    this.clientToNoteId.set(client, noteId);
    const clients = this.noteIdToClients.get(noteId);
    if (!clients) {
      this.noteIdToClients.set(noteId, [client]);
      return;
    }
    clients.push(client);
    this.noteIdToClients.set(noteId, clients);
  }

  /**
   * Removes a client from this mapping instance.
   * @param client The WebSocket client to remove. Must be added to the instance in beforehand.
   * @throws Error if the client does not exist in this mapping instance.
   */
  public removeClient(client: WebSocket): void {
    const noteId = this.getNoteIdByClient(client);
    if (!noteId) {
      throw new Error('Client does not exist in map');
    }
    this.clientToNoteId.delete(client);
    const clients = this.noteIdToClients.get(noteId);
    if (!clients) {
      return;
    }
    const filteredClients = clients.filter((aClient) => aClient === client);
    if (filteredClients.length === 0) {
      this.noteIdToClients.delete(noteId);
    } else {
      this.noteIdToClients.set(noteId, filteredClients);
    }
  }

  /**
   * Returns a list of all WebSocket clients participating on a note.
   * @param noteId The internal identifier (from database) of the note.
   * @returns WebSocket[] An array of WebSocket clients.
   */
  public getClientsByNoteId(noteId: string): WebSocket[] {
    const clients = this.noteIdToClients.get(noteId);
    if (!clients) {
      throw new Error('noteId does not exist in map');
    }
    return clients;
  }

  /**
   * Returns the internal note identifier that a WebSocket client is participating at.
   * @param client The WebSocket client.
   * @returns string The identifier of the note, if found in this mapping instance.
   * @returns undefined If the client is not present in this mapping instance.
   */
  public getNoteIdByClient(client: WebSocket): string | undefined {
    return this.clientToNoteId.get(client);
  }

  /**
   * Returns the number of clients connected to any note.
   * @returns number The number of WebSocket clients.
   */
  public countClients(): number {
    return this.clientToNoteId.size;
  }

  /**
   * Returns the number of notes with at least one client connection.
   * This is ensured because the disconnect of the last client on a note, results
   * in removal of this note id in the mapping instance.
   * @returns number The number of notes with at least one active client connection.
   */
  public countNotes(): number {
    return this.noteIdToClients.size;
  }
}
