// nodejs-server-steps.component.ts
import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, query, stagger, sequence } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nodejs-server-steps',
  templateUrl: './nodejs-server-steps.component.html',
  styleUrls: ['./nodejs-server-steps.component.scss'],
  standalone: true,
  imports: [CommonModule , FormsModule],
  animations: [
    trigger('stepAnimation', [
      transition(':enter', [
        query('.step', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('300ms', [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('typingAnimation', [
      transition(':enter', [
        sequence([
          style({ width: '0', opacity: 0, overflow: 'hidden' }),
          animate('1s ease', style({ width: '*', opacity: 1 })),
        ])
      ])
    ])
  ]
})
export class NodejsServerStepsComponent implements OnInit {
  steps = [
    {
      title: 'Initialize your project',
      code: 'npm init -y',
      show: false
    },
    {
      title: 'Install Express',
      code: 'npm install express',
      show: false
    },
    {
      title: 'Create server file',
      code: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
      show: false
    },
    {
      title: 'Start the server',
      code: 'node server.js',
      note: 'Or with nodemon for development:',
      noteCode: 'npx nodemon server.js',
      show: false
    }
  ];

  ngOnInit() {
    this.animateSteps();
  }
// In your component
get step3Code(): string {
  return `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
}
  animateSteps() {
    this.steps.forEach((step, index) => {
      setTimeout(() => {
        step.show = true;
      }, index * 1000); // 1 second delay between steps
    });
  }
}