import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { ChatState, selectChatMessages } from '../state/chat/chat.reducer';
import { AddChatMessageAction } from '../state/chat/chat.actions';
import { ChatMessage } from '../state/chat/chat.model';

@Component({
  selector: 'app-chat',
  template: `
    <div class="chat">
      <div class="chat-history">
        <div class="message" *ngFor="let message of messages$ | async">
          <div class="message-header">
            {{ message.sender }} - {{ message.timestamp | date:'shortTime' }}
          </div>
          <div class="message-body">
            {{ message.text }}
          </div>
        </div>
      </div>
      <div class="chat-input">
        <form (ngSubmit)="sendMessage()">
          <input type="text" [(ngModel)]="message" placeholder="Type a message...">
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages$: Observable<ChatMessage[]>;
  message: string;

  constructor(private store: Store<ChatState>) { }

  ngOnInit() {
    // Load chat history from local storage
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.forEach(message => this.store.dispatch(new AddChatMessageAction(message)));
    
    // Select chat messages from store
    this.messages$ = this.store.pipe(select(selectChatMessages));
  }

  sendMessage() {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'Me',
      timestamp: new Date(),
      text: this.message
    };
    this.store.dispatch(new AddChatMessageAction(newMessage));

    // Persist chat history to local storage
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    chatHistory.push(newMessage);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

    // Clear input field
    this.message = '';
  }
}
