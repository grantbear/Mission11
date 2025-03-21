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
}
