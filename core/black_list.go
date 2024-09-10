package core

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	msql "github.com/discuitnet/discuit/internal/sql"
	"github.com/discuitnet/discuit/internal/uid"
)

// BlackList represents a blacklisted domain entry
type BlackList struct {
	db *sql.DB

	ID        uid.ID    `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	Domain    string    `json:"domain"`
}

// NewBlackList initializes a new BlackList instance
func NewBlackList(db *sql.DB) *BlackList {
	return &BlackList{db: db}
}

// buildSelectBlackListQuery constructs the SQL query for selecting from the blacklist
func buildSelectBlackListQuery(where string) string {
	cols := []string{
		"black_lists.id",
		"black_lists.created_at",
		"black_lists.domain",
	}
	return msql.BuildSelectQuery("black_lists", cols, nil, where)
}

// ReadBlackList retrieves a blacklist entry by its ID.
// Since it's not a method on the BlackList struct, it takes *sql.DB as an argument.
func GetBlackDomainById(ctx context.Context, db *sql.DB, id uid.ID) (*BlackList, error) {
	where := fmt.Sprintf("black_lists.id = '%s'", id.String())
	query := buildSelectBlackListQuery(where)

	row := db.QueryRowContext(ctx, query)

	var entry BlackList
	err := row.Scan(&entry.ID, &entry.CreatedAt, &entry.Domain)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("no blacklist entry found with ID %v", id)
		}
		return nil, fmt.Errorf("failed to read blacklist entry: %v", err)
	}
	return &entry, nil
}

// GetAllBlackLists retrieves all blacklist entries from the database.
func GetAllBlackDomains(ctx context.Context, db *sql.DB) ([]BlackList, error) {
	query := buildSelectBlackListQuery("") // No WHERE clause to get all entries
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all blacklist entries: %v", err)
	}
	defer rows.Close()

	var blacklists []BlackList
	for rows.Next() {
		var entry BlackList
		if err := rows.Scan(&entry.ID, &entry.CreatedAt, &entry.Domain); err != nil {
			return nil, fmt.Errorf("failed to scan blacklist entry: %v", err)
		}
		blacklists = append(blacklists, entry)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over blacklist rows: %v", err)
	}

	return blacklists, nil
}

// Create inserts a new domain into the blacklist
func CreateNewBlackDomain(ctx context.Context, db *sql.DB, domain string) (*BlackList, error) {
	id := uid.New() // Generate a new unique ID
	createdAt := time.Now()

	query := `INSERT INTO black_lists (id, created_at, domain) VALUES (?, ?, ?)`
	_, err := db.ExecContext(ctx, query, id, createdAt, domain)
	if err != nil {
		return nil, fmt.Errorf("failed to create blacklist entry: %v", err)
	}
	return &BlackList{
		db:        db,
		ID:        id,
		CreatedAt: createdAt,
		Domain:    domain,
	}, nil
}

// Read retrieves a blacklist entry by its ID
func (bl *BlackList) Read(id uid.ID) (*BlackList, error) {
	where := fmt.Sprintf("black_lists.id = '%s'", id.String())
	query := buildSelectBlackListQuery(where)

	row := bl.db.QueryRow(query)

	var entry BlackList
	entry.db = bl.db
	err := row.Scan(&entry.ID, &entry.CreatedAt, &entry.Domain)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("no blacklist entry found with ID %v", id)
		}
		return nil, fmt.Errorf("failed to read blacklist entry: %v", err)
	}
	return &entry, nil
}

func CheckBlackDomain(ctx context.Context, db *sql.DB, domain string) error {
	// Get all blacklisted domains from the database
	domains, err := GetAllBlackDomains(ctx, db)
	if err != nil {
		return err
	}

	// Split the domain into parts
	parts := strings.Split(domain, ".")

	// Check all possible parent domains
	for i := 0; i < len(parts)-1; i++ {
		for _, d := range domains {
			if d.Domain == parts[i] {
				return fmt.Errorf("domain email is in black lists")
			}
		}
	}

	return nil
}

// Update modifies an existing blacklist entry
func (bl *BlackList) Update(id uid.ID, newDomain string) error {
	query := `UPDATE black_lists SET domain = ? WHERE id = ?`
	_, err := bl.db.Exec(query, newDomain, id)
	if err != nil {
		return fmt.Errorf("failed to update blacklist entry: %v", err)
	}
	return nil
}

// Delete removes a blacklist entry by its ID
func (bl *BlackList) Delete(id uid.ID) error {
	query := `DELETE FROM black_lists WHERE id = ?`
	_, err := bl.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete blacklist entry: %v", err)
	}
	return nil
}
