using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_mission11.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend_mission11;

[Route("api/[controller]")]
[ApiController]
public class BooksController : ControllerBase
{
    private readonly BookDbContext _context;

    public BooksController(BookDbContext context)
    {
        _context = context;
    }

    // GET: api/books
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
    {
        var books = await _context.Books.ToListAsync();
        return Ok(books);
    }

    // DELETE: api/books/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
        {
            return NotFound();
        }

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();

        return NoContent(); // HTTP 204
    }

    // PUT: api/books/5
[HttpPut("{id}")]
public async Task<IActionResult> UpdateBook(int id, [FromBody] Book updatedBook)
{
    if (id != updatedBook.BookID)
    {
        return BadRequest("ID in URL does not match ID in body.");
    }

    var existingBook = await _context.Books.FindAsync(id);
    if (existingBook == null)
    {
        return NotFound();
    }

    // Update properties
    existingBook.Title = updatedBook.Title;
    existingBook.Author = updatedBook.Author;
    existingBook.Category = updatedBook.Category;
    existingBook.Price = updatedBook.Price;

    await _context.SaveChangesAsync();
    return NoContent(); // HTTP 204
}

[HttpPost]
public async Task<ActionResult<Book>> AddBook([FromBody] Book newBook)
{
    _context.Books.Add(newBook);
    await _context.SaveChangesAsync();
    return CreatedAtAction(nameof(GetBooks), new { id = newBook.BookID }, newBook);
}


}

