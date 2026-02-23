import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CodeToken {
  text: string;
  cls: string;
}

export interface CodeLine {
  tokens: CodeToken[];
  indent?: number;      // padding-left en rem: 1 = 1rem, 2 = 2rem, 3 = 3rem
  hasCursor?: boolean;  // muestra el cursor parpadeante al final de la línea
}

export interface CodeSnippet {
  filename: string;
  badge: string;
  lines: CodeLine[];
}

// ─── Snippets ─────────────────────────────────────────────────────────────────
// Para agregar o modificar un snippet, edita este array.
// Cada objeto sigue la interfaz CodeSnippet.

const SNIPPETS: CodeSnippet[] = [

  // 1. Clean Architecture · CQRS
  {
    filename: 'OrderHandler.cs',
    badge: 'C# · .NET 8',
    lines: [
      { tokens: [{ text: '// Clean Architecture · CQRS', cls: 'text-slate-500' }] },
      { tokens: [] },
      {
        tokens: [
          { text: 'namespace', cls: 'text-purple-400' },
          { text: ' Orders.Application', cls: 'text-teal-300' },
          { text: ';', cls: 'text-slate-400' },
        ],
      },
      { tokens: [] },
      { tokens: [{ text: 'public sealed record', cls: 'text-blue-400' }] },
      {
        indent: 1,
        tokens: [
          { text: 'CreateOrderCommand', cls: 'text-yellow-300' },
          { text: '(', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'Guid', cls: 'text-teal-300' },
          { text: ' CustomerId', cls: 'text-sky-300' },
          { text: ',', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'IList<OrderItem>', cls: 'text-teal-300' },
          { text: ' Items', cls: 'text-sky-300' },
        ],
      },
      {
        indent: 1,
        tokens: [
          { text: ') : ', cls: 'text-slate-400' },
          { text: 'IRequest', cls: 'text-yellow-300' },
          { text: '<', cls: 'text-slate-400' },
          { text: 'Result<Guid>', cls: 'text-teal-300' },
          { text: '>;', cls: 'text-slate-400' },
        ],
      },
      { tokens: [] },
      {
        tokens: [
          { text: 'public class', cls: 'text-blue-400' },
          { text: ' CreateOrderHandler', cls: 'text-yellow-300' },
        ],
      },
      { tokens: [{ text: '{', cls: 'text-slate-400' }] },
      {
        indent: 1,
        tokens: [
          { text: 'public async', cls: 'text-blue-400' },
          { text: ' Task<Result<Guid>>', cls: 'text-teal-300' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'Handle', cls: 'text-yellow-300' },
          { text: '(', cls: 'text-slate-400' },
          { text: 'CreateOrderCommand', cls: 'text-teal-300' },
          { text: ' cmd', cls: 'text-sky-300' },
          { text: ',', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 3,
        tokens: [
          { text: 'CancellationToken', cls: 'text-teal-300' },
          { text: ' ct', cls: 'text-sky-300' },
          { text: ')', cls: 'text-slate-400' },
        ],
      },
      { indent: 1, tokens: [{ text: '{', cls: 'text-slate-400' }] },
      {
        indent: 2,
        tokens: [
          { text: 'var', cls: 'text-blue-400' },
          { text: ' order', cls: 'text-sky-300' },
          { text: ' = ', cls: 'text-slate-400' },
          { text: 'Order', cls: 'text-yellow-300' },
          { text: '.', cls: 'text-slate-400' },
          { text: 'Create', cls: 'text-green-400' },
          { text: '(cmd);', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'await', cls: 'text-blue-400' },
          { text: ' _repo', cls: 'text-sky-300' },
          { text: '.', cls: 'text-slate-400' },
          { text: 'AddAsync', cls: 'text-green-400' },
          { text: '(order, ct);', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'return', cls: 'text-blue-400' },
          { text: ' Result', cls: 'text-yellow-300' },
          { text: '.', cls: 'text-slate-400' },
          { text: 'Success', cls: 'text-green-400' },
          { text: '(order.Id);', cls: 'text-slate-400' },
        ],
      },
      { indent: 1, tokens: [{ text: '}', cls: 'text-slate-400' }] },
      { tokens: [{ text: '}', cls: 'text-slate-400' }], hasCursor: true },
    ],
  },

  // 2. Azure Blob Storage · Cloud
  {
    filename: 'BlobStorageService.cs',
    badge: 'C# · Azure SDK v12',
    lines: [
      { tokens: [{ text: '// Azure Blob Storage · SDK v12', cls: 'text-slate-500' }] },
      { tokens: [] },
      {
        tokens: [
          { text: 'using', cls: 'text-purple-400' },
          { text: ' Azure.Storage.Blobs', cls: 'text-teal-300' },
          { text: ';', cls: 'text-slate-400' },
        ],
      },
      { tokens: [] },
      {
        tokens: [
          { text: 'public class', cls: 'text-blue-400' },
          { text: ' BlobStorageService', cls: 'text-yellow-300' },
        ],
      },
      { tokens: [{ text: '{', cls: 'text-slate-400' }] },
      {
        indent: 1,
        tokens: [
          { text: 'private readonly', cls: 'text-blue-400' },
          { text: ' BlobServiceClient', cls: 'text-teal-300' },
          { text: ' _client', cls: 'text-sky-300' },
          { text: ';', cls: 'text-slate-400' },
        ],
      },
      { tokens: [] },
      {
        indent: 1,
        tokens: [
          { text: 'public async', cls: 'text-blue-400' },
          { text: ' Task<Uri>', cls: 'text-teal-300' },
          { text: ' UploadAsync', cls: 'text-yellow-300' },
          { text: '(', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'string', cls: 'text-teal-300' },
          { text: ' container', cls: 'text-sky-300' },
          { text: ',', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'Stream', cls: 'text-teal-300' },
          { text: ' content', cls: 'text-sky-300' },
          { text: ',', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'CancellationToken', cls: 'text-teal-300' },
          { text: ' ct', cls: 'text-sky-300' },
          { text: ')', cls: 'text-slate-400' },
        ],
      },
      { indent: 1, tokens: [{ text: '{', cls: 'text-slate-400' }] },
      {
        indent: 2,
        tokens: [
          { text: 'var', cls: 'text-blue-400' },
          { text: ' blob', cls: 'text-sky-300' },
          { text: ' = _client', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 3,
        tokens: [
          { text: '.', cls: 'text-slate-400' },
          { text: 'GetBlobContainerClient', cls: 'text-green-400' },
          { text: '(container)', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 3,
        tokens: [
          { text: '.', cls: 'text-slate-400' },
          { text: 'GetBlobClient', cls: 'text-green-400' },
          { text: '(', cls: 'text-slate-400' },
          { text: 'Guid', cls: 'text-teal-300' },
          { text: '.', cls: 'text-slate-400' },
          { text: 'NewGuid', cls: 'text-green-400' },
          { text: '().ToString());', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'await', cls: 'text-blue-400' },
          { text: ' blob', cls: 'text-sky-300' },
          { text: '.', cls: 'text-slate-400' },
          { text: 'UploadAsync', cls: 'text-green-400' },
          { text: '(content, ct);', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'return', cls: 'text-blue-400' },
          { text: ' blob', cls: 'text-sky-300' },
          { text: '.Uri;', cls: 'text-slate-400' },
        ],
      },
      { indent: 1, tokens: [{ text: '}', cls: 'text-slate-400' }] },
      { tokens: [{ text: '}', cls: 'text-slate-400' }], hasCursor: true },
    ],
  },

  // 3. Entity Framework Core · Bases de Datos
  {
    filename: 'AppDbContext.cs',
    badge: 'C# · EF Core 8',
    lines: [
      { tokens: [{ text: '// Entity Framework Core · Code First', cls: 'text-slate-500' }] },
      { tokens: [] },
      {
        tokens: [
          { text: 'public class', cls: 'text-blue-400' },
          { text: ' AppDbContext', cls: 'text-yellow-300' },
          { text: ' : ', cls: 'text-slate-400' },
          { text: 'DbContext', cls: 'text-teal-300' },
        ],
      },
      { tokens: [{ text: '{', cls: 'text-slate-400' }] },
      {
        indent: 1,
        tokens: [
          { text: 'public', cls: 'text-blue-400' },
          { text: ' DbSet', cls: 'text-teal-300' },
          { text: '<', cls: 'text-slate-400' },
          { text: 'Order', cls: 'text-yellow-300' },
          { text: '>', cls: 'text-slate-400' },
          { text: ' Orders', cls: 'text-sky-300' },
          { text: ' { ', cls: 'text-slate-400' },
          { text: 'get', cls: 'text-blue-400' },
          { text: '; ', cls: 'text-slate-400' },
          { text: 'set', cls: 'text-blue-400' },
          { text: '; }', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 1,
        tokens: [
          { text: 'public', cls: 'text-blue-400' },
          { text: ' DbSet', cls: 'text-teal-300' },
          { text: '<', cls: 'text-slate-400' },
          { text: 'Customer', cls: 'text-yellow-300' },
          { text: '>', cls: 'text-slate-400' },
          { text: ' Customers', cls: 'text-sky-300' },
          { text: ' { ', cls: 'text-slate-400' },
          { text: 'get', cls: 'text-blue-400' },
          { text: '; ', cls: 'text-slate-400' },
          { text: 'set', cls: 'text-blue-400' },
          { text: '; }', cls: 'text-slate-400' },
        ],
      },
      { tokens: [] },
      {
        indent: 1,
        tokens: [
          { text: 'protected override', cls: 'text-blue-400' },
          { text: ' void', cls: 'text-teal-300' },
          { text: ' OnModelCreating', cls: 'text-yellow-300' },
          { text: '(', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'ModelBuilder', cls: 'text-teal-300' },
          { text: ' builder', cls: 'text-sky-300' },
          { text: ')', cls: 'text-slate-400' },
        ],
      },
      { indent: 1, tokens: [{ text: '{', cls: 'text-slate-400' }] },
      {
        indent: 2,
        tokens: [
          { text: 'builder', cls: 'text-sky-300' },
          { text: '.', cls: 'text-slate-400' },
          { text: 'ApplyConfigurationsFromAssembly', cls: 'text-green-400' },
          { text: '(', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 3,
        tokens: [
          { text: 'typeof', cls: 'text-blue-400' },
          { text: '(', cls: 'text-slate-400' },
          { text: 'AppDbContext', cls: 'text-yellow-300' },
          { text: ').', cls: 'text-slate-400' },
          { text: 'Assembly', cls: 'text-sky-300' },
          { text: ');', cls: 'text-slate-400' },
        ],
      },
      { indent: 1, tokens: [{ text: '}', cls: 'text-slate-400' }] },
      { tokens: [{ text: '}', cls: 'text-slate-400' }], hasCursor: true },
    ],
  },

  // 4. SQL Server · Stored Procedure
  {
    filename: 'sp_GetOrders.sql',
    badge: 'T-SQL · SQL Server',
    lines: [
      { tokens: [{ text: '-- SQL Server · Stored Procedure', cls: 'text-slate-500' }] },
      { tokens: [] },
      {
        tokens: [
          { text: 'CREATE OR ALTER', cls: 'text-blue-400' },
          { text: ' PROCEDURE', cls: 'text-blue-400' },
        ],
      },
      {
        indent: 1,
        tokens: [{ text: 'dbo.sp_GetOrdersByCustomer', cls: 'text-yellow-300' }],
      },
      {
        indent: 1,
        tokens: [
          { text: '@CustomerId', cls: 'text-sky-300' },
          { text: '  ', cls: 'text-slate-400' },
          { text: 'UNIQUEIDENTIFIER', cls: 'text-teal-300' },
          { text: ',', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 1,
        tokens: [
          { text: '@PageSize', cls: 'text-sky-300' },
          { text: '     ', cls: 'text-slate-400' },
          { text: 'INT', cls: 'text-teal-300' },
          { text: ' = ', cls: 'text-slate-400' },
          { text: '20', cls: 'text-amber-300' },
        ],
      },
      {
        tokens: [
          { text: 'AS', cls: 'text-blue-400' },
          { text: ' BEGIN', cls: 'text-blue-400' },
        ],
      },
      {
        indent: 1,
        tokens: [
          { text: 'SET', cls: 'text-blue-400' },
          { text: ' NOCOUNT', cls: 'text-purple-400' },
          { text: ' ON', cls: 'text-blue-400' },
          { text: ';', cls: 'text-slate-400' },
        ],
      },
      { tokens: [] },
      { indent: 1, tokens: [{ text: 'SELECT', cls: 'text-blue-400' }] },
      {
        indent: 2,
        tokens: [
          { text: 'o', cls: 'text-sky-300' },
          { text: '.', cls: 'text-slate-400' },
          { text: 'OrderId', cls: 'text-yellow-300' },
          { text: ',', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'o', cls: 'text-sky-300' },
          { text: '.', cls: 'text-slate-400' },
          { text: 'CreatedAt', cls: 'text-yellow-300' },
          { text: ',', cls: 'text-slate-400' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'SUM', cls: 'text-green-400' },
          { text: '(i.', cls: 'text-slate-400' },
          { text: 'Quantity', cls: 'text-yellow-300' },
          { text: ' * i.', cls: 'text-slate-400' },
          { text: 'UnitPrice', cls: 'text-yellow-300' },
          { text: ') AS ', cls: 'text-slate-400' },
          { text: 'Total', cls: 'text-sky-300' },
        ],
      },
      {
        indent: 1,
        tokens: [
          { text: 'FROM', cls: 'text-blue-400' },
          { text: ' dbo.', cls: 'text-slate-400' },
          { text: 'Orders', cls: 'text-yellow-300' },
          { text: ' o', cls: 'text-sky-300' },
        ],
      },
      {
        indent: 1,
        tokens: [
          { text: 'INNER JOIN', cls: 'text-blue-400' },
          { text: ' dbo.', cls: 'text-slate-400' },
          { text: 'OrderItems', cls: 'text-yellow-300' },
          { text: ' i', cls: 'text-sky-300' },
        ],
      },
      {
        indent: 2,
        tokens: [
          { text: 'ON', cls: 'text-blue-400' },
          { text: ' o.', cls: 'text-slate-400' },
          { text: 'OrderId', cls: 'text-yellow-300' },
          { text: ' = i.', cls: 'text-slate-400' },
          { text: 'OrderId', cls: 'text-yellow-300' },
        ],
      },
      {
        indent: 1,
        tokens: [
          { text: 'WHERE', cls: 'text-blue-400' },
          { text: ' o.', cls: 'text-slate-400' },
          { text: 'CustomerId', cls: 'text-yellow-300' },
          { text: ' = ', cls: 'text-slate-400' },
          { text: '@CustomerId', cls: 'text-sky-300' },
        ],
      },
      {
        indent: 1,
        tokens: [
          { text: 'ORDER BY', cls: 'text-blue-400' },
          { text: ' o.', cls: 'text-slate-400' },
          { text: 'CreatedAt', cls: 'text-yellow-300' },
          { text: ' DESC;', cls: 'text-slate-400' },
        ],
      },
      { tokens: [{ text: 'END;', cls: 'text-blue-400' }], hasCursor: true },
    ],
  },

];

// ─── Componente ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-about',
  imports: [ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit, OnDestroy {
  visibleLines = 0;
  currentSnippetIndex = 0;
  readonly snippets = SNIPPETS;

  get currentSnippet(): CodeSnippet {
    return this.snippets[this.currentSnippetIndex];
  }

  private lineTimer: any;
  private pauseTimer: any;

  ngOnInit(): void {
    this.startTyping();
  }

  ngOnDestroy(): void {
    if (this.lineTimer) clearInterval(this.lineTimer);
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
  }

  isLineVisible(i: number): boolean {
    return i < this.visibleLines;
  }

  private startTyping(): void {
    this.visibleLines = 0;
    this.lineTimer = setInterval(() => {
      this.visibleLines++;
      if (this.visibleLines >= this.currentSnippet.lines.length) {
        clearInterval(this.lineTimer);
        // Espera 3s y pasa al siguiente snippet
        this.pauseTimer = setTimeout(() => {
          this.currentSnippetIndex =
            (this.currentSnippetIndex + 1) % this.snippets.length;
          this.startTyping();
        }, 3000);
      }
    }, 185);
  }
}
