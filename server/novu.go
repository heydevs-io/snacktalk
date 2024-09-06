package server

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"strings"

	"github.com/discuitnet/discuit/core"
	novu "github.com/novuhq/go-novu/lib"
)

type SubscriberResponse struct {
	Data interface{} `json:"data"`
}

func (s *Server) IdentifyUser(ctx context.Context, user *core.User) error {
	backendURL, err := url.Parse(s.config.NovuApiUrl)
	if err != nil {
		log.Fatalf("Failed to parse URL: %v", err)
	}

	novuClient := novu.NewAPIClient(s.config.NovuApiKey, &novu.Config{
		BackendURL: backendURL,
	})

	// Check if the subscriber already exists
	_, err = novuClient.SubscriberApi.Get(ctx, user.ID.String())

	if err != nil {
		if strings.Contains(err.Error(), "status code 404") {

			phone := ""
			if user.PhoneCode != "" && user.PhoneNumber != "" {
				phone = user.PhoneCode + user.PhoneNumber
			}

			data := map[string]interface{}{
				"email":     user.Email,
				"firstName": user.FullName,
				"phone":     phone,
			}

			_, err := novuClient.SubscriberApi.Identify(ctx, user.ID.String(), data)
			if err != nil {
				return fmt.Errorf("failed to identify subscriber: %w", err)
			}
		} else {
			return fmt.Errorf("failed to get subscriber: %w", err)
		}
	}

	return nil
}

func (s *Server) HandleSendOtp(ctx context.Context, user *core.User, otp string) error {
	s.IdentifyUser(ctx, user)

	backendURL, err := url.Parse(s.config.NovuApiUrl)
	if err != nil {
		log.Fatalf("Failed to parse URL: %v", err)
	}

	novuClient := novu.NewAPIClient(s.config.NovuApiKey, &novu.Config{
		BackendURL: backendURL,
	})

	to := map[string]interface{}{
		"subscriberId": user.ID,
		"email":        user.Email,
	}

	payload := map[string]interface{}{
		"userName": user.Username,
		"otp":      otp,
	}

	data := novu.ITriggerPayloadOptions{To: to, Payload: payload}

	_, err = novuClient.EventApi.Trigger(ctx, "send-otp", data)

	if err != nil {
		return fmt.Errorf("failed to send otp: %w", err)
	}

	return nil
}
