package server

import (
	"fmt"

	"github.com/discuitnet/discuit/core"
	"github.com/discuitnet/discuit/internal/httperr"
)

func (s *Server) getBlackListDomains(w *responseWriter, r *request) error {
	fmt.Printf("request: %+v\n", *r)

	if !r.loggedIn {
		return errNotLoggedIn
	}

	admin, err := core.GetUser(r.ctx, s.db, *r.viewer, r.viewer)
	if err != nil {
		return err
	}

	fmt.Printf("%+v\n", *admin)

	if !admin.Admin {
		return httperr.NewForbidden("not_admin", "You are not an admin.")
	}

	domains, err := core.GetAllBlackDomains(r.ctx, s.db)

	if err != nil {
		return err
	}

	return w.writeJSON(domains)
}

func (s *Server) createBlackDomain(w *responseWriter, r *request) error {
	if !r.loggedIn {
		return errNotLoggedIn
	}

	admin, err := core.GetUser(r.ctx, s.db, *r.viewer, r.viewer)
	if err != nil {
		return err
	}

	if !admin.Admin {
		return httperr.NewForbidden("not_admin", "You are not an admin.")
	}

	values, err := r.unmarshalJSONBodyToStringsMap(true)

	if err != nil {
		return err
	}

	domain := values["domain"]

	result, err := core.CreateNewBlackDomain(r.ctx, s.db, domain)

	if err != nil {
		return err
	}

	return w.writeJSON(result)
}

func (s *Server) createBlackDomains(w *responseWriter, r *request) error {
	if !r.loggedIn {
		return errNotLoggedIn
	}

	admin, err := core.GetUser(r.ctx, s.db, *r.viewer, r.viewer)
	if err != nil {
		return err
	}

	if !admin.Admin {
		return httperr.NewForbidden("not_admin", "You are not an admin.")
	}

	values, err := r.unmarshalJSONBodyToMap()
	if err != nil {
		return err
	}

	domainsInterface, ok := values["domains"].([]interface{})
	if !ok {
		return httperr.NewBadRequest("invalid_domains", "Invalid domains list.")
	}

	var domains []string
	for _, domain := range domainsInterface {
		strDomain, ok := domain.(string)
		if !ok {
			return httperr.NewBadRequest("invalid_domain_type", "One or more domains are not of type string.")
		}
		domains = append(domains, strDomain)
	}
	type result struct {
		Domain string          `json:"domain"`
		Error  string          `json:"error,omitempty"`
		Result *core.BlackList `json:"result,omitempty"`
	}
	var results []result

	for _, domain := range domains {
		blacklistEntry, err := core.CreateNewBlackDomain(r.ctx, s.db, domain)
		if err != nil {
			results = append(results, result{Domain: domain, Error: err.Error()})
		} else {
			results = append(results, result{Domain: domain, Result: blacklistEntry})
		}
	}

	return w.writeJSON(results)
}
